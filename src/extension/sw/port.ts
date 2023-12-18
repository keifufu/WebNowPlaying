import { Adapter, BuiltInAdapters, CustomAdapter, Settings, SocketInfo, defaultSocketInfoState } from "../../utils/settings";
import { EventResult, Player, StateMode, defaultPlayer } from "../types";
import { readSettings } from "./shared";
import { MessageType, WNPSocket } from "./socket";

const disconnectTimeouts = new Map<string, NodeJS.Timeout>();
const playerDictionary = new Map<string, Player>();
const ports = new Map<string, chrome.runtime.Port>();
const sockets = new Map<number, WNPSocket>();
let activePlayerId: string | null = null;

export function sendEventResult(eventSocketPort: number, eventId: string, eventStatus: EventResult) {
  const socket = sockets.get(eventSocketPort);
  if (socket) {
    switch (socket.communicationRevision) {
      case "legacy":
      case "1":
      case "2":
        break;
      case "3":
        socket.send(`${MessageType.EVENT_RESULT} ${eventId} ${eventStatus}`);
        break;
    }
  }
}

function sendUpdateToAll(oldPlayer: Player | null, partialPlayer: Partial<Player>) {
  for (const socket of sockets.values()) {
    socket.sendUpdate(playerDictionary.get(activePlayerId ?? "") ?? defaultPlayer, playerDictionary, oldPlayer, partialPlayer);
  }

  for (const port of infoPorts.values()) {
    port.postMessage({ player: playerDictionary.get(activePlayerId ?? "") ?? defaultPlayer });
  }
}

function executeEvent(eventSocketPort: number, communicationRevision: string, eventData: string) {
  switch (communicationRevision) {
    case "legacy":
    case "1":
    case "2": {
      const port = ports.get(activePlayerId ?? "");
      if (!port) return;
      port.postMessage({
        event: "executeEvent",
        communicationRevision,
        eventData,
      });
      port.postMessage({ event: "getPlayer" });
      break;
    }
    case "3": {
      const [id, eventId, ...data] = eventData.split(" ");
      const port = ports.get(id);
      if (!port) {
        return sendEventResult(eventSocketPort, eventId, EventResult.FAILED);
      }
      port.postMessage({
        event: "executeEvent",
        communicationRevision,
        eventId,
        eventData: data.join(" "),
        eventSocketPort,
      });
      port.postMessage({ event: "getPlayer" });
      break;
    }
  }
}

function recalculateActivePlayer() {
  let _activePlayerId = null;
  let maxActiveAt = 0;
  let foundActive = false;

  for (const [id, player] of playerDictionary) {
    if (player.state === StateMode.PLAYING && player.volume > 0 && player.activeAt > maxActiveAt) {
      _activePlayerId = id;
      maxActiveAt = player.activeAt;
      foundActive = true;
    } else if (player.activeAt > maxActiveAt && !foundActive) {
      _activePlayerId = id;
      maxActiveAt = player.activeAt;
    }
  }

  activePlayerId = _activePlayerId;
}

const infoPorts = new Map<number, chrome.runtime.Port>();
let infoPortsId = 0;

export function onPortConnect(port: chrome.runtime.Port) {
  if (port.name === "info") {
    const id = infoPortsId++;
    infoPorts.set(id, port);
    port.onDisconnect.addListener(() => {
      infoPorts.delete(id);
    });
    port.onMessage.addListener((msg) => {
      executeEvent(0, "3", `${activePlayerId} 0 ${msg}`);
    });
    return;
  }

  clearTimeout(disconnectTimeouts.get(port.name));
  disconnectTimeouts.delete(port.name);
  ports.set(port.name, port);

  // Forces the port to reconnect, this is so it won't become idle.
  const timer = setTimeout(() => {
    ports.delete(port.name);
    port.disconnect();
  }, 250e3); // 4.17 minutes

  port.onMessage.addListener(onPortMessage);
  port.onDisconnect.addListener(() => {
    // This only gets fired if the other side disconnects,
    // not if we call .disconnect().
    clearTimeout(timer);
    ports.delete(port.name);

    // If the port does not reconnect within 500ms, remove it from playerDictionary.
    disconnectTimeouts.set(
      port.name,
      setTimeout(() => {
        playerDictionary.delete(port.name);
        recalculateActivePlayer();
        sendUpdateToAll(null, {});
      }, 500),
    );
  });
}

type PortMessage = {
  event: "player";
  player: Partial<Player>;
};

function onPortMessage(message: PortMessage, port: chrome.runtime.Port) {
  switch (message.event) {
    case "player": {
      const currentPlayer = playerDictionary.get(port.name);

      if (!currentPlayer) {
        message.player.id = parseInt(port.name);
      }

      playerDictionary.set(port.name, {
        ...(currentPlayer || defaultPlayer),
        ...message.player,
      });

      if ((message.player.title?.length ?? 0) > 0) {
        recalculateActivePlayer();
      }

      sendUpdateToAll(currentPlayer ?? null, message.player);
      break;
    }
  }
}

// We want to update settings after they change, we don't want to read them every time (in getSocketInfo particularly)
// this is called from messaging.ts after any settings were changed.
let settings: Settings;
export async function updateSettings() {
  settings = await readSettings();
  sockets.forEach((socket) => socket.sendSettings(settings));
}

let updateInterval: NodeJS.Timeout | null = null;
export async function reloadSockets() {
  settings = await readSettings();
  if (updateInterval) clearInterval(updateInterval);

  // Close all sockets
  for (const [key, socket] of sockets.entries()) {
    socket.close();
    sockets.delete(key);
  }

  // Open all sockets
  for (const adapter of BuiltInAdapters) {
    if (settings.enabledBuiltInAdapters.includes(adapter.name)) sockets.set(adapter.port, new WNPSocket(adapter, executeEvent));
  }
  for (const adapter of settings.customAdapters) {
    if (adapter.enabled && adapter.port !== 0) sockets.set(adapter.port, new WNPSocket(adapter, executeEvent));
  }

  // Create a new update interval
  updateInterval = setInterval(() => {
    for (const port of ports.values()) {
      port.postMessage({ event: "getPlayerOptimized" });
    }
  }, 250);
}

export async function connectSocket(port: number) {
  settings = await readSettings();
  let adapter: Adapter | CustomAdapter | undefined = BuiltInAdapters.find((a) => a.port === port);
  if (!adapter) adapter = settings.customAdapters.find((a) => a.port === port);
  if (!adapter || sockets.has(port)) return;
  sockets.set(adapter.port, new WNPSocket(adapter, executeEvent));
}

export function disconnectSocket(port: number) {
  const socket = sockets.get(port);
  if (!socket) return;
  socket.close();
  sockets.delete(port);
}

export function getSocketInfo() {
  const info: SocketInfo = {
    states: new Map(),
  };

  for (const [key, socket] of sockets.entries()) {
    info.states.set(key, {
      version: socket.version,
      isConnected: socket.isConnected,
      isConnecting: socket.isConnecting,
      reconnectAttempts: socket.reconnectAttempts,
    });
  }

  // Fill in info for not connected sockets
  for (const adapter of BuiltInAdapters) {
    if (info.states.has(adapter.port)) continue;
    info.states.set(adapter.port, {
      ...defaultSocketInfoState,
      _isPlaceholder: false,
    });
  }

  for (const adapter of settings.customAdapters) {
    if (info.states.has(adapter.port)) continue;
    info.states.set(adapter.port, {
      ...defaultSocketInfoState,
      _isPlaceholder: false,
    });
  }

  return info;
}
