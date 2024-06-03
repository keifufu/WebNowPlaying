import { randomToken } from "../../utils/misc";
import { TSupportedSites, defaultSettings } from "../../utils/settings";
import { ServiceWorkerUtils } from "../../utils/sw";
import { EventError, EventResult, Player, Repeat, SiteArgs, SiteFunctions, SiteIndex, SiteReturnValues, StateMode, defaultPlayer } from "../types";

const exec = async function <T extends SiteFunctions>(this: SiteIndex, func: T, args: SiteArgs[T], shouldThrow = true) {
  const res = await ContentUtils.execFunc(this.name, func, args);
  if (shouldThrow && res === EventResult.FAILED) {
    throw new EventError();
  }
  return res;
};

const siteIndex: SiteIndex[] = [
  {
    match: () => window.location.hostname === "music.apple.com",
    name: "Apple Music",
    exec,
  },
  {
    match: () => window.location.hostname.endsWith("bandcamp.com") || !!document.querySelector('[content="@bandcamp"]'),
    name: "Bandcamp",
    exec,
  },
  {
    match: () => window.location.hostname === "www.deezer.com",
    name: "Deezer",
    exec,
  },
  {
    match: () => !!document.querySelector('link[title="Invidious"]'),
    name: "Invidious",
    exec,
  },
  {
    match: () => !!document.querySelector('[content="Jellyfin"]'),
    name: "Jellyfin",
    exec,
  },
  {
    match: () => window.location.hostname === "kick.com",
    name: "Kick",
    exec,
  },
  {
    match: () => !!document.querySelector('[content="Navidrome"]'),
    name: "Navidrome",
    exec,
  },
  {
    match: () => window.location.hostname === "www.netflix.com",
    name: "Netflix",
    exec,
  },
  {
    match: () => window.location.hostname === "www.pandora.com",
    name: "Pandora",
    exec,
  },
  {
    match: () => !!document.querySelector("#plex"),
    name: "Plex",
    exec,
  },
  {
    match: () => window.location.hostname === "www.radio-addict.com",
    name: "Radio Addict",
    exec,
  },
  {
    match: () => window.location.hostname === "soundcloud.com",
    name: "Soundcloud",
    exec,
  },
  {
    match: () => window.location.hostname === "open.spotify.com",
    name: "Spotify",
    exec,
  },
  {
    match: () => window.location.hostname === "listen.tidal.com",
    name: "Tidal",
    exec,
  },
  {
    match: () => window.location.hostname === "www.twitch.tv",
    name: "Twitch",
    exec,
  },
  {
    match: () => window.location.hostname === "vk.com",
    name: "VK",
    exec,
  },
  {
    match: () => window.location.hostname === "music.yandex.ru" || window.location.hostname === "music.yandex.com",
    name: "Yandex Music",
    exec,
  },
  {
    match: () => window.location.hostname === "www.youtube.com" && !window.location.pathname.startsWith("/embed"),
    name: "YouTube",
    exec,
  },
  {
    match: () => window.location.hostname === "www.youtube.com" && window.location.pathname.startsWith("/embed"),
    name: "YouTube Embeds",
    exec,
  },
  {
    match: () => window.location.hostname === "music.youtube.com",
    name: "YouTube Music",
    exec,
  },
];

const GenericSite: SiteIndex = {
  match: () => {
    const settings = ContentUtils.getSettings();
    if (settings.useGeneric) {
      if (settings.useGenericList) {
        if (settings.isListBlocked && settings.genericList.includes(location.hostname)) return false;
        if (!settings.isListBlocked && !settings.genericList.includes(location.hostname)) return false;
      }
      return true;
    }
    return false;
  },
  name: "Generic",
  exec,
};

export type PortMessage = {
  event: "getPlayer" | "getPlayerOptimized" | "executeEvent";
  communicationRevision?: "legacy" | "1" | "2" | "3";
  eventData?: string;
  eventId?: string;
  eventSocketPort?: number;
};

let port: chrome.runtime.Port;
let infoPort: chrome.runtime.Port | null = null;
let _currentSite: SiteIndex | null = null;
let _lastLocation: string = "";
let _settings = defaultSettings;
const ContentUtils = {
  getSettings: () => _settings,
  init: async () => {
    _settings = await ServiceWorkerUtils.getSettings();

    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) ServiceWorkerUtils.setColorScheme("light");
      else ServiceWorkerUtils.setColorScheme("dark");
    };
    onChange(matchMedia("(prefers-color-scheme: light)"));
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", onChange);

    if (ContentUtils.getCurrentSite() !== null) {
      // init() is only called when the content script loads/reloads
      // so we should also reload the injected script
      document.querySelector("#wnp-injected")?.remove();
      const script = document.createElement("script");
      script.id = "wnp-injected";
      script.src = chrome.runtime.getURL("injected.js");
      document.documentElement.appendChild(script);
    }

    if (ContentUtils.getCurrentSite() !== null) {
      const portId = await ServiceWorkerUtils.getPortId();
      if (portId == null) {
        console.error("[WebNowPlaying] Failed to get a port id, why?");
        return;
      }
      ContentUtils.connectPort(portId);
    }

    window.addEventListener("message", (msg) => {
      if (msg.data.type !== "wnp-info") return;

      if (msg.data.subscribe === true) {
        ContentUtils.connectInfoPort();
      } else if (msg.data.subscribe === false) {
        if (!infoPort) return;
        infoPort.disconnect();
        infoPort = null;
        window.postMessage(
          {
            type: "wnp-info",
            player: defaultPlayer,
          },
          "*",
        );
      } else if (msg.data.command) {
        if (!infoPort) return;
        infoPort.postMessage(msg.data.command);
      }
    });
  },
  connectInfoPort() {
    infoPort = chrome.runtime.connect({ name: "info" });
    // This only gets fired if the other side disconnects,
    // not if we call .disconnect().
    infoPort.onDisconnect.addListener(() => ContentUtils.connectInfoPort());
    infoPort.onMessage.addListener((message) => {
      if (message.player) {
        window.postMessage(
          {
            type: "wnp-info",
            player: message.player,
          },
          "*",
        );
      }
    });
  },
  connectPort(id: number) {
    port = chrome.runtime.connect({ name: id.toString() });
    port.onDisconnect.addListener(() => ContentUtils.connectPort(id));
    port.onMessage.addListener(ContentUtils.onMessage);
  },
  async onMessage(message: PortMessage, port: chrome.runtime.Port) {
    switch (message.event) {
      case "getPlayer":
      case "getPlayerOptimized": {
        const player = await getPlayer(message.event === "getPlayerOptimized");
        port.postMessage({
          event: "player",
          player,
        });
        break;
      }
      case "executeEvent":
        if (!message.communicationRevision || !message.eventData) break;
        switch (message.communicationRevision) {
          case "legacy":
            OnEventLegacy(message.eventData);
            break;
          case "1":
            OnEventRev1(message.eventData);
            break;
          case "2":
            OnEventRev2(message.eventData);
            break;
          case "3":
            OnEventRev3(message.eventData, message.eventId as string, message.eventSocketPort as number);
            break;
          default:
            break;
        }
        break;
    }
  },
  execFunc: <T extends SiteFunctions>(siteName: TSupportedSites, func: T, args: SiteArgs[T]): Promise<SiteReturnValues[T]> => {
    return new Promise((resolve) => {
      const messageId = randomToken();
      const listener = (msg: any) => {
        if (msg.data.type === "wnp-response" && msg.data.messageId === messageId) {
          resolve(msg.data.returnValue);
          window.removeEventListener("message", listener);
        }
      };
      window.addEventListener("message", listener);
      window.postMessage({ type: "wnp-message", messageId, siteName, func, args }, "*");
    });
  },
  getCurrentSite(): SiteIndex | null {
    if (_lastLocation == document.location.href) return _currentSite;
    const settings = ContentUtils.getSettings();

    let match = false;
    let currentSite = null;
    for (const site of siteIndex) {
      if (site.match()) {
        match = true;
        if (!settings.disabledSites.includes(site.name)) currentSite = site;
      }
    }

    // Only apply generic if no supported site matched, ignoring disabled sites.
    // This is so that generic won't load on YouTube when the user disabled YouTube in the settings.
    if (!match && GenericSite.match()) {
      currentSite = GenericSite;
      GenericSite.exec("init", undefined);
    }

    _currentSite = currentSite;
    _lastLocation = document.location.href;
    return currentSite;
  },
};
/* Entry function */
ContentUtils.init();

const playerCache = new Map<string, any>();
async function getPlayer(optimized = false): Promise<Partial<Player>> {
  const site = ContentUtils.getCurrentSite();
  if (!site) return {};

  const player = await site.exec(optimized ? "getPlayerOptimized" : "getPlayer", undefined);
  if (!player) return {};

  const result: Partial<Player> = {};

  if (!playerCache.get("createdAt")) {
    result.createdAt = Date.now();
    playerCache.set("createdAt", result.createdAt);
  }

  for (const key in player) {
    if (key === "updatedAt" || key === "createdAt" || key === "activeAt" || key === "id") continue;

    const value = player[key as keyof typeof player];
    if (playerCache.get(key) !== value) {
      playerCache.set(key, value);

      result[key as keyof Player] = value as any;
      result.updatedAt = Date.now();

      // If artist or title changed, reset sanitize cache
      if (key === "artist" || key == "title") {
        result.artist = sanitizeArtist(player.artist);
        result.title = sanitizeTitle(player.title, result.artist);
      }

      // activeAt calculation
      if (key === "state" || key === "title" || (key === "volume" && player.state === StateMode.PLAYING)) {
        result.activeAt = value.toString().length > 0 ? Date.now() : 0;
      }
    }
  }

  return result;
}

function sanitizeArtist(artist: string) {
  const settings = ContentUtils.getSettings();
  if (settings.enabledSanitizationId.includes("sanitizeArtist")) {
    artist = artist.replace(/\s?-\s?topic/i, "").trim();
    artist = artist.replace(/\s?VEVO/i, "").trim();
  }
  return artist;
}

function sanitizeTitle(title: string, sanitizedArtist: string) {
  const settings = ContentUtils.getSettings();

  if (settings.enabledSanitizationId.includes("sanitizeTitle")) {
    const junk = [
      /\b(official video)\b/gi,
      /\(official video\)/gi,
      /\b(music video)\b/gi,
      /\(music video\)/gi,
      /\b(official lyric video)\b/gi,
      /\(official lyric video\)/gi,
      /\b(official audio)\b/gi,
      /\(official audio\)/gi,
      /\b(lyrics)\b/gi,
      /\(lyrics\)/gi,
    ];

    junk.forEach((pattern) => {
      title = title.replace(pattern, "").trim();
    });
  }
  if (settings.enabledSanitizationId.includes("removeDuplicateArtists")) {
    title = title.replace(new RegExp(`${sanitizedArtist}\\s?-\\s?`, "i"), "").trim();
  }
  if (settings.enabledSanitizationId.includes("standardizeFeaturing")) {
    const featuringPattern = /\b(feat\.?|featuring|ft\.?)\b/gi;
    title = title.replace(featuringPattern, "ft.").trim();

    if (settings.enabledSanitizationId.includes("moveFeaturingToEnd")) {
      let featuringText = "";
      title = title
        .replace(/\(ft\. ([^)]+)\)/g, (match, group1) => {
          featuringText = group1;
          return "";
        })
        .trim();
      if (featuringText.length > 0) {
        title = title.replace(featuringPattern, "").trim() + " ft. " + featuringText;
      }
    } else {
      title = title.replace(/\(ft\. ([^)]+)\)/g, "ft. $1").trim();
    }
  }

  return title.replaceAll("  ", " ");
}

async function OnEventLegacy(message: string) {
  try {
    enum Events {
      PLAYPAUSE,
      PREVIOUS,
      NEXT,
      SETPOSITION,
      SETVOLUME,
      REPEAT,
      SHUFFLE,
      TOGGLETHUMBSUP,
      TOGGLETHUMBSDOWN,
      RATING,
    }

    const site = ContentUtils.getCurrentSite();
    if (!site) return null;
    const [type, data] = message.toUpperCase().split(" ");
    const player = await site.exec("getPlayer", undefined);

    switch (Events[type as keyof typeof Events]) {
      case Events.PLAYPAUSE:
        if (!player.canSetState) throw new EventError();
        await site.exec("setState", player.state === StateMode.PLAYING ? StateMode.PAUSED : StateMode.PLAYING);
        break;
      case Events.PREVIOUS:
        if (!player.canSkipPrevious) throw new EventError();
        await site.exec("setPosition", 0, false);
        await site.exec("skipPrevious", undefined);
        break;
      case Events.NEXT:
        if (!player.canSkipNext) throw new EventError();
        await site.exec("skipNext", undefined);
        break;
      case Events.SETPOSITION: {
        if (!player.canSetPosition) throw new EventError();
        // Example string: SetPosition 34:SetProgress 0,100890207715134:
        const [positionInSeconds /* , positionPercentStr */] = data.split(":");
        // const positionPercent = positionPercentStr.split("SETPROGRESS ")[1];
        const res1 = await site.exec("setPosition", parseInt(positionInSeconds), false);
        // We replace(',', '.') because all legacy versions didn't use InvariantCulture
        // const res2 = await site.exec("setPositionPercent", parseFloat(positionPercent.replace(",", ".")), false);
        if (res1 === EventResult.FAILED /* && res2 === EventResult.FAILED */) throw new EventError();
        break;
      }
      case Events.SETVOLUME:
        if (!player.canSetVolume) throw new EventError();
        await site.exec("setVolume", parseInt(data));
        break;
      case Events.REPEAT: {
        if (!player.canSetRepeat) throw new EventError();

        let nextRepeat = player.repeat;
        const supportsNone = player.availableRepeat & Repeat.NONE;
        const supportsAll = player.availableRepeat & Repeat.ALL;
        const supportsOne = player.availableRepeat & Repeat.ONE;

        switch (player.repeat) {
          case Repeat.NONE:
            nextRepeat = supportsAll ? Repeat.ALL : supportsOne ? Repeat.ONE : player.repeat;
            break;
          case Repeat.ALL:
            nextRepeat = supportsOne ? Repeat.ONE : supportsNone ? Repeat.NONE : player.repeat;
            break;
          case Repeat.ONE:
            nextRepeat = supportsNone ? Repeat.NONE : supportsAll ? Repeat.ALL : player.repeat;
            break;
        }

        if (nextRepeat == player.repeat) throw new EventError();
        await site.exec("setRepeat", nextRepeat);
        break;
      }
      case Events.SHUFFLE:
        if (!player.canSetShuffle) throw new EventError();
        await site.exec("setShuffle", !player.shuffle);
        break;
      case Events.TOGGLETHUMBSUP:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", player.rating === 5 ? 0 : 5);
        break;
      case Events.TOGGLETHUMBSDOWN:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", player.rating === 1 ? 0 : 1);
        break;
      case Events.RATING:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", parseInt(data));
        break;
      default:
        break;
    }
  } catch (err) {
    // no error handling in legacy
  }
}

async function OnEventRev1(message: string) {
  try {
    enum Events {
      TOGGLE_PLAYING,
      PREVIOUS,
      NEXT,
      SET_POSITION,
      SET_VOLUME,
      TOGGLE_REPEAT,
      TOGGLE_SHUFFLE,
      TOGGLE_THUMBS_UP,
      TOGGLE_THUMBS_DOWN,
      SET_RATING,
    }

    const site = ContentUtils.getCurrentSite();
    if (!site) return null;
    const [type, data] = message.toUpperCase().split(" ");
    const player = await site.exec("getPlayer", undefined);

    switch (Events[type as keyof typeof Events]) {
      case Events.TOGGLE_PLAYING:
        if (!player.canSetState) throw new EventError();
        await site.exec("setState", player.state === StateMode.PLAYING ? StateMode.PAUSED : StateMode.PLAYING);
        break;
      case Events.PREVIOUS:
        if (!player.canSkipPrevious) throw new EventError();
        await site.exec("setPosition", 0, false);
        await site.exec("skipPrevious", undefined);
        break;
      case Events.NEXT:
        if (!player.canSkipNext) throw new EventError();
        await site.exec("skipNext", undefined);
        break;
      case Events.SET_POSITION: {
        if (!player.canSetPosition) throw new EventError();
        const [positionInSeconds /* , positionPercent */] = data.split(":");
        const res1 = await site.exec("setPosition", parseInt(positionInSeconds), false);
        // We still replace(',', '.') because v1.0.0 - v1.0.5 didn't use InvariantCulture
        // const res2 = await site.exec("setPositionPercent", parseFloat(positionPercent.replace(",", ".")), false);
        if (res1 === EventResult.FAILED /* && res2 === EventResult.FAILED */) throw new EventError();
        break;
      }
      case Events.SET_VOLUME:
        if (!player.canSetVolume) throw new EventError();
        await site.exec("setVolume", parseInt(data));
        break;
      case Events.TOGGLE_REPEAT: {
        if (!player.canSetRepeat) throw new EventError();

        let nextRepeat = player.repeat;
        const supportsNone = player.availableRepeat & Repeat.NONE;
        const supportsAll = player.availableRepeat & Repeat.ALL;
        const supportsOne = player.availableRepeat & Repeat.ONE;

        switch (player.repeat) {
          case Repeat.NONE:
            nextRepeat = supportsAll ? Repeat.ALL : supportsOne ? Repeat.ONE : player.repeat;
            break;
          case Repeat.ALL:
            nextRepeat = supportsOne ? Repeat.ONE : supportsNone ? Repeat.NONE : player.repeat;
            break;
          case Repeat.ONE:
            nextRepeat = supportsNone ? Repeat.NONE : supportsAll ? Repeat.ALL : player.repeat;
            break;
        }

        if (nextRepeat == player.repeat) throw new EventError();
        await site.exec("setRepeat", nextRepeat);
        break;
      }
      case Events.TOGGLE_SHUFFLE:
        if (!player.canSetShuffle) throw new EventError();
        await site.exec("setShuffle", !player.shuffle);
        break;
      case Events.TOGGLE_THUMBS_UP:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", player.rating === 5 ? 0 : 5);
        break;
      case Events.TOGGLE_THUMBS_DOWN:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", player.rating === 1 ? 0 : 1);
        break;
      case Events.SET_RATING:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", parseInt(data));
        break;
      default:
        break;
    }
  } catch (err) {
    // no error handling in v1
  }
}

async function OnEventRev2(message: string) {
  try {
    enum Events {
      TRY_SET_STATE,
      TRY_SKIP_PREVIOUS,
      TRY_SKIP_NEXT,
      TRY_SET_POSITION,
      TRY_SET_VOLUME,
      TRY_TOGGLE_REPEAT_MODE,
      TRY_TOGGLE_SHUFFLE_ACTIVE,
      TRY_SET_RATING,
    }

    const site = ContentUtils.getCurrentSite();
    if (!site) return null;
    const [type, data] = message.toUpperCase().split(" ");
    const player = await site.exec("getPlayer", undefined);

    switch (Events[type as keyof typeof Events]) {
      case Events.TRY_SET_STATE:
        if (!player.canSetState) throw new EventError();
        await site.exec("setState", data === "STOPPED" ? StateMode.STOPPED : data === "PLAYING" ? StateMode.PLAYING : StateMode.PAUSED);
        break;
      case Events.TRY_SKIP_PREVIOUS:
        if (!player.canSkipPrevious) throw new EventError();
        await site.exec("setPosition", 0, false);
        await site.exec("skipPrevious", undefined);
        break;
      case Events.TRY_SKIP_NEXT:
        if (!player.canSkipNext) throw new EventError();
        await site.exec("skipNext", undefined);
        break;
      case Events.TRY_SET_POSITION: {
        if (!player.canSetPosition) throw new EventError();
        const [positionInSeconds /* , positionPercent */] = data.split(":");
        const res1 = await site.exec("setPosition", parseInt(positionInSeconds), false);
        // const res2 = await site.exec("setPositionPercent", parseFloat(positionPercent), false);
        if (res1 === EventResult.FAILED /* && res2 === EventResult.FAILED */) throw new EventError();
        break;
      }
      case Events.TRY_SET_VOLUME:
        if (!player.canSetVolume) throw new EventError();
        await site.exec("setVolume", parseInt(data));
        break;
      case Events.TRY_TOGGLE_REPEAT_MODE: {
        if (!player.canSetRepeat) throw new EventError();

        let nextRepeat = player.repeat;
        const supportsNone = player.availableRepeat & Repeat.NONE;
        const supportsAll = player.availableRepeat & Repeat.ALL;
        const supportsOne = player.availableRepeat & Repeat.ONE;

        switch (player.repeat) {
          case Repeat.NONE:
            nextRepeat = supportsAll ? Repeat.ALL : supportsOne ? Repeat.ONE : player.repeat;
            break;
          case Repeat.ALL:
            nextRepeat = supportsOne ? Repeat.ONE : supportsNone ? Repeat.NONE : player.repeat;
            break;
          case Repeat.ONE:
            nextRepeat = supportsNone ? Repeat.NONE : supportsAll ? Repeat.ALL : player.repeat;
            break;
        }

        if (nextRepeat == player.repeat) throw new EventError();
        await site.exec("setRepeat", nextRepeat);
        break;
      }
      case Events.TRY_TOGGLE_SHUFFLE_ACTIVE:
        if (!player.canSetShuffle) throw new EventError();
        await site.exec("setShuffle", !player.shuffle);
        break;
      case Events.TRY_SET_RATING:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", parseInt(data));
        break;
      default:
        break;
    }
  } catch (err) {
    // no error handling in v2
  }
}

async function OnEventRev3(message: string, eventId: string, eventSocketPort: number) {
  try {
    enum Events {
      TRY_SET_STATE = 0,
      TRY_SKIP_PREVIOUS = 1,
      TRY_SKIP_NEXT = 2,
      TRY_SET_POSITION = 3,
      TRY_SET_VOLUME = 4,
      TRY_SET_RATING = 5,
      TRY_SET_REPEAT = 6,
      TRY_SET_SHUFFLE = 7,
    }

    const site = ContentUtils.getCurrentSite();
    if (!site) return null;
    const [type, data] = message.split(" ");
    const player = await site.exec("getPlayer", undefined);

    switch (parseInt(type)) {
      case Events.TRY_SET_STATE:
        if (!player.canSetState) throw new EventError();
        await site.exec("setState", parseInt(data));
        break;
      case Events.TRY_SKIP_PREVIOUS:
        if (!player.canSkipPrevious) throw new EventError();
        await site.exec("setPosition", 0, false);
        await site.exec("skipPrevious", undefined);
        break;
      case Events.TRY_SKIP_NEXT:
        if (!player.canSkipNext) throw new EventError();
        await site.exec("skipNext", undefined);
        break;
      case Events.TRY_SET_POSITION:
        if (!player.canSetPosition) throw new EventError();
        await site.exec("setPosition", parseInt(data));
        break;
      case Events.TRY_SET_VOLUME:
        if (!player.canSetVolume) throw new EventError();
        await site.exec("setVolume", parseInt(data));
        break;
      case Events.TRY_SET_RATING:
        if (!player.canSetRating) throw new EventError();
        await site.exec("setRating", parseInt(data));
        break;
      case Events.TRY_SET_REPEAT: {
        if (!player.canSetRating) throw new EventError();
        const repeat = data === "ALL" ? Repeat.ALL : data === "ONE" ? Repeat.ONE : Repeat.NONE;
        if (!(player.availableRepeat & repeat)) throw new EventError();
        await site.exec("setRepeat", repeat);
        break;
      }
      case Events.TRY_SET_SHUFFLE:
        if (!player.canSetShuffle) throw new EventError();
        await site.exec("setShuffle", !!parseInt(data));
        break;
    }

    ServiceWorkerUtils.sendEventResult(eventSocketPort, eventId, EventResult.SUCCEEDED);
  } catch (err) {
    if (err instanceof EventError) {
      ServiceWorkerUtils.sendEventResult(eventSocketPort, eventId, EventResult.FAILED);
    } else {
      console.error("[WebNowPlaying] Failed to handle event error (1)", err);
      ServiceWorkerUtils.sendEventResult(eventSocketPort, eventId, EventResult.FAILED);
    }
  }
}
