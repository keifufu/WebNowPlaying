import { isVersionOutdated, timeInSecondsToString } from "../../utils/misc";
import { Adapter, CustomAdapter, Settings } from "../../utils/settings";
import { Player, RatingSystem, Repeat, StateMode } from "../types";
import { getGithubVersion, readSettings, setOutdated } from "./shared";

export enum MessageType {
  PLAYER_ADDED = 0,
  PLAYER_UPDATED = 1,
  PLAYER_REMOVED = 2,
  EVENT_RESULT = 3,
  USE_DESKTOP_PLAYERS = 4,
}

export class WNPSocket {
  ws: WebSocket | null = null;
  adapter: Adapter | CustomAdapter;
  cache = new Map<string, any>();
  reconnectAttempts = 0;
  version = "0.0.0";
  communicationRevision: string | null = null;
  connectionTimeout: NodeJS.Timeout | null = null;
  versionConnectionTimeout: NodeJS.Timeout | null = null;
  reconnectTimeout: NodeJS.Timeout | null = null;
  isClosed = false;
  executeEvent: (eventSocketPort: number, communicationRevision: string, data: string) => void;

  constructor(adapter: Adapter | CustomAdapter, executeEvent: (eventSocketPort: number, communicationRevision: string, data: string) => void) {
    this.adapter = adapter;
    this.executeEvent = executeEvent;
    this.init();
  }

  private init() {
    if (this.isClosed) return;
    // try/catch does nothing. If the connection fails, it will call onError.
    // The extension will only log errors to chrome://extensions if it's loaded unpacked.
    // It won't show those errors to the user.
    this.ws = new WebSocket(`ws://127.0.0.1:${this.adapter.port}`);
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);

    // Force connection to not take longer than 5 seconds
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    this.connectionTimeout = setTimeout(() => {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      }
      this.retry();
    }, 5000);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get isConnecting() {
    return !this.isClosed && this.ws?.readyState !== WebSocket.OPEN;
  }

  public close() {
    this.isClosed = true;
    this.cleanup();
  }

  private cleanup() {
    this.cache = new Map<string, any>();
    this.communicationRevision = null;
    this.version = "0.0.0";
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    if (this.versionConnectionTimeout) clearTimeout(this.versionConnectionTimeout);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }

  private retry() {
    if (this.isClosed) return;
    this.cleanup();
    // Reconnects once per 5 seconds for 30 seconds, then with a exponential backoff of (2^reconnectAttempts) up to 60 seconds
    this.reconnectTimeout = setTimeout(
      () => {
        this.init();
        this.reconnectAttempts += 1;
      },
      Math.min(5000 * (this.reconnectAttempts <= 30 ? 1 : 2 ** (this.reconnectAttempts - 30)), 60000),
    );
  }

  public send(data: string | ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(data);
  }

  private onOpen() {
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    this.reconnectAttempts = 0;
    // If no communication revision is received within 1 second, assume it's WNP for Rainmeter < 0.5.0 (legacy)
    this.versionConnectionTimeout = setTimeout(() => {
      if (this.communicationRevision === null) {
        this.communicationRevision = "legacy";
        this.version = "0.5.0";
      }
    }, 1000);
  }

  private onClose() {
    this.retry();
  }

  private onError() {
    this.retry();
  }

  private async onMessage(event: MessageEvent<string>) {
    if (this.communicationRevision) {
      this.executeEvent(this.adapter.port, this.communicationRevision, event.data);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (event.data.startsWith("Version:")) {
        // 'Version:' WNP for Rainmeter 0.5.0 (legacy)
        this.communicationRevision = "legacy";
        this.version = "0.5.0";
        setOutdated();
      } else if (event.data.startsWith("ADAPTER_VERSION ")) {
        // Adapters should send 'ADAPTER_VERSION <version>;WNPLIB_REVISION <revision>' after connecting
        this.communicationRevision = event.data.split(";")[1].split(" ")[1];
        // Check if the adapter is outdated
        const adapterVersion = event.data.split(" ")[1].split(";")[0];
        this.version = adapterVersion;
        if ((this.adapter as Adapter).gh) {
          const githubVersion = await getGithubVersion((this.adapter as Adapter).gh);
          if (githubVersion === "Error") return;
          if (isVersionOutdated(adapterVersion, githubVersion)) setOutdated();
        }

        this.sendSettings();
      } else {
        // The first message wasn't version related, so it's probably WNP for Rainmeter < 0.5.0 (legacy)
        this.communicationRevision = "legacy";
        this.version = "0.5.0";
        setOutdated();
      }
    }
  }

  public async sendSettings(_settings?: Settings) {
    // settings are only passed on update, not when this is called from onMessage
    let settings = _settings;
    if (!settings) settings = await readSettings();

    switch (this.communicationRevision) {
      case "legacy":
      case "1":
        break;
      case "2":
        this.send(`USE_NATIVE_APIS ${settings.useDesktopPlayers}`);
        break;
      case "3":
        this.send(`${MessageType.USE_DESKTOP_PLAYERS} ${settings.useDesktopPlayers ? 1 : 0}`);
        break;
    }
  }

  public sendUpdate(player: Player, playerDictionary: Map<string, Player>, oldPlayer: Player | null, partialPlayer: Partial<Player>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    switch (this.communicationRevision) {
      case "legacy":
        SendPlayerLegacy(this, player);
        break;
      case "1":
        SendPlayerRev1(this, player);
        break;
      case "2":
        SendPlayerRev2(this, player);
        break;
      case "3":
        SendPlayerRev3(this, playerDictionary, oldPlayer, partialPlayer);
        break;
      default:
        break;
    }
  }
}

function SendPlayerLegacy(self: WNPSocket, player: Player) {
  for (let key in player) {
    if (
      [
        "id",
        "availableRepeat",
        "canSetState",
        "canSkipPrevious",
        "canSkipNext",
        "canSetPosition",
        "canSetVolume",
        "canSetRating",
        "canSetRepeat",
        "canSetShuffle",
        "ratingSystem",
        "createdAt",
        "updatedAt",
        "activeAt",
      ].includes(key)
    )
      continue;
    let value = player[key as keyof Player];

    // Conversion to legacy keys
    if (key === "name") key = "player";

    // Conversion to legacy values
    if (key === "state") value = value === StateMode.PLAYING ? 1 : value === StateMode.PAUSED ? 2 : 0;
    else if (key === "duration") value = timeInSecondsToString(value as number);
    else if (key === "position") value = timeInSecondsToString(value as number);
    else if (key === "repeat") value = value === Repeat.ALL ? 2 : value === Repeat.ONE ? 1 : 0;
    else if (key === "shuffle") value = value ? 1 : 0;

    // Check for null, and not just falsy, because 0 and '' are falsy
    if (value !== null && value !== self.cache.get(key)) {
      self.send(`${key.toUpperCase()}:${value}`);
      self.cache.set(key, value);
    }
  }
}

function SendPlayerRev1(self: WNPSocket, player: Player) {
  for (let key in player) {
    if (
      [
        "id",
        "ratingSystem",
        "availableRepeat",
        "canSetState",
        "canSkipPrevious",
        "canSkipNext",
        "canSetPosition",
        "canSetVolume",
        "canSetRating",
        "canSetRepeat",
        "canSetShuffle",
        "createdAt",
        "updatedAt",
        "activeAt",
      ].includes(key)
    )
      continue;
    let value = player[key as keyof Player];

    // Conversion to rev1 keys
    if (key === "name") key = "player";

    // Conversion to rev1 values
    if (key === "duration") value = timeInSecondsToString(value as number);
    else if (key === "position") value = timeInSecondsToString(value as number);
    else if (key === "state") value = value === StateMode.PAUSED ? "PAUSED" : value === StateMode.PLAYING ? "PLAYING" : "STOPPED";
    else if (key === "repeat") value = value === Repeat.NONE ? "NONE" : value === Repeat.ALL ? "ALL" : "ONE";

    // Check for null, and not just falsy, because 0 and '' are falsy
    if (value !== null && value !== self.cache.get(key)) {
      self.send(`${key.toUpperCase()} ${value}`);
      self.cache.set(key, value);
    }
  }
}

function SendPlayerRev2(self: WNPSocket, player: Player) {
  const formatKey = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
  for (let key in player) {
    if (
      [
        "id",
        "ratingSystem",
        "availableRepeat",
        "canSkipPrevious",
        "canSkipNext",
        "canSetPosition",
        "canSetVolume",
        "canSetRepeat",
        "canSetShuffle",
        "canSetRating",
        "createdAt",
        "updatedAt",
        "activeAt",
      ].includes(key)
    )
      continue;
    let value = player[key as keyof Player];

    // Conversion to rev2 keys
    if (key === "name") key = "playerName";
    else if (key === "cover") key = "coverUrl";
    else if (key === "position") key = "positionSeconds";
    else if (key === "duration") key = "durationSeconds";
    else if (key === "repeat") key = "repeatMode";
    else if (key === "shuffle") key = "shuffleActive";

    // conversion to rev2 values
    if (key === "state") value = value === StateMode.PAUSED ? "PAUSED" : value === StateMode.PLAYING ? "PLAYING" : "STOPPED";
    else if (key === "repeatMode") value = value === Repeat.NONE ? "NONE" : value === Repeat.ALL ? "ALL" : "ONE";

    if (key === "canSetState") {
      key = "playerControls";
      const val = {
        supports_play_pause: player.canSetState,
        supports_skip_previous: player.canSkipPrevious,
        supports_skip_next: player.canSkipNext,
        supports_set_position: player.canSetPosition,
        supports_set_volume: player.canSetVolume,
        supports_toggle_repeat_mode: player.canSetRepeat,
        supports_toggle_shuffle_active: player.canSetShuffle,
        supports_set_rating: player.canSetRating,
        rating_system:
          player.ratingSystem === RatingSystem.NONE
            ? "NONE"
            : player.ratingSystem === RatingSystem.LIKE
            ? "LIKE"
            : player.ratingSystem === RatingSystem.LIKE_DISLIKE
            ? "LIKE_DISLIKE"
            : "SCALE",
      };
      value = JSON.stringify(val);
    }

    // Check for null, and not just falsy, because 0 and '' are falsy
    if (value !== null && value !== self.cache.get(key)) {
      self.send(`${formatKey(key)} ${value}`);
      self.cache.set(key, value);
    }
  }
}

function makePlayerData(player: Partial<Player>) {
  return (
    [
      player.id,
      player.name,
      player.title,
      player.artist,
      player.album,
      player.cover,
      player.state,
      player.position,
      player.duration,
      player.volume,
      player.rating,
      player.repeat,
      player.shuffle,
      player.ratingSystem,
      player.availableRepeat,
      player.canSetState,
      player.canSkipPrevious,
      player.canSkipNext,
      player.canSetPosition,
      player.canSetVolume,
      player.canSetRating,
      player.canSetRepeat,
      player.canSetShuffle,
      player.createdAt,
      player.updatedAt,
      player.activeAt,
    ]
      .map((val) =>
        typeof val === "string"
          ? val.length == 0
            ? String.fromCharCode(1)
            : val.replaceAll("|", "\\|")
          : typeof val === "boolean"
          ? val
            ? 1
            : 0
          : val,
      )
      .join("|") + "|"
  );
}

type CoverBlob = {
  failed: boolean;
  blob: Blob;
};

const failedCoverBlob: CoverBlob = {
  failed: true,
  blob: new Blob(),
};

async function convertToPng(blob: Blob) {
  const data = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(data.width, data.height);
  const ctx = canvas.getContext("2d");
  canvas.width = data.width;
  canvas.height = data.height;
  ctx?.drawImage(data, 0, 0);
  return await canvas.convertToBlob({ type: "image/png" });
}

async function requestCoverBlob(cover: string): Promise<CoverBlob> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      const response = await fetch(cover);
      const contentType = response.headers.get("content-type");

      // We always convert to png
      let blob: Blob | undefined = undefined;
      if (contentType) {
        if (contentType.includes("image/png")) {
          blob = await response.blob();
        } else if (contentType.includes("image/jpeg")) {
          blob = await convertToPng(await response.blob());
        } else if (contentType.includes("image/webp")) {
          blob = await convertToPng(await response.blob());
        } else {
          console.error(`File extension not supported for cover: ${cover}`);
          return resolve(failedCoverBlob);
        }
      }

      if (blob != undefined) {
        resolve({
          failed: false,
          blob,
        });
      } else {
        resolve(failedCoverBlob);
      }
    } catch (error) {
      console.error(`Failed to download cover from ${cover}: ${error}`);
      resolve(failedCoverBlob);
    }
  });
}

async function sendCoverRev3(self: WNPSocket, id: number, cover: string): Promise<boolean> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      const cover_blob = await requestCoverBlob(cover);
      if (cover_blob.failed) {
        return resolve(false);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const fileArrayBuffer = reader.result as ArrayBuffer;
        const totalLength = 4 + fileArrayBuffer.byteLength;
        const combinedArrayBuffer = new ArrayBuffer(totalLength);
        const dataView = new DataView(combinedArrayBuffer);
        dataView.setUint32(0, id, true);
        const fileData = new Uint8Array(fileArrayBuffer);
        const combinedData = new Uint8Array(combinedArrayBuffer, 4);
        combinedData.set(fileData);
        self.send(combinedArrayBuffer);
        resolve(true);
      };
      reader.readAsArrayBuffer(cover_blob.blob);
    } catch (error) {
      console.error(`Failed to download cover from ${cover}: ${error}`);
      resolve(false);
    }
  });
}

function SendPlayerRev3(self: WNPSocket, playerDictionary: Map<string, Player>, oldPlayer: Player | null, partialPlayer: Partial<Player>) {
  playerDictionary.forEach(async (player, key) => {
    if (!self.cache.has(key)) {
      self.cache.set(key, player);
      if (player.cover) {
        const success = await sendCoverRev3(self, player.id, player.cover);
        if (!success) {
          player.cover = "";
        }
      }
      const playerData = makePlayerData(player);
      self.send(`${MessageType.PLAYER_ADDED} ${player.id} ${playerData}`);
    } else {
      if (oldPlayer && player.id === oldPlayer.id) {
        if (Object.keys(partialPlayer).length === 0) return;
        if (partialPlayer.cover) {
          const success = await sendCoverRev3(self, player.id, partialPlayer.cover);
          if (!success) {
            partialPlayer.cover = "";
          }
        }
        const playerData = makePlayerData(partialPlayer);
        self.send(`${MessageType.PLAYER_UPDATED} ${player.id} ${playerData}`);
      }
    }
  });
  self.cache.forEach((player, key) => {
    if (!playerDictionary.has(key)) {
      self.send(`${MessageType.PLAYER_REMOVED} ${player.id}`);
      self.cache.delete(key);
    }
  });
}
