import { randomToken } from "../../utils/misc";
import { defaultSettings } from "../../utils/settings";
import { ServiceWorkerUtils } from "../../utils/sw";
import { MediaInfo, NetflixInfo, Site, SiteInfo, StateMode, VKInfo, YouTubeInfo } from "../types";
import AppleMusic from "./sites/AppleMusic";
import Bandcamp from "./sites/Bandcamp";
import Deezer from "./sites/Deezer";
import Generic from "./sites/Generic";
import Invidious from "./sites/Invidious";
import Jellyfin from "./sites/Jellyfin";
import Kick from "./sites/Kick";
import Navidrome from "./sites/Navidrome";
import Netflix from "./sites/Netflix";
import Pandora from "./sites/Pandora";
import Plex from "./sites/Plex";
import RadioAddict from "./sites/RadioAddict";
import Soundcloud from "./sites/Soundcloud";
import Spotify from "./sites/Spotify";
import Tidal from "./sites/Tidal";
import Twitch from "./sites/Twitch";
import VK from "./sites/VK";
import YandexMusic from "./sites/YandexMusic";
import YouTube from "./sites/YouTube";
import YouTubeEmbed from "./sites/YouTubeEmbed";
import YouTubeMusic from "./sites/YouTubeMusic";

// This is for use in any file that ends up compiled into content.js
// as instead of constantly requesting the settings from the service
// worker, we just store it in a variable
let _settings = defaultSettings;
export const ContentUtils = {
  getSettings: () => _settings,
  init: async () => {
    _settings = await ServiceWorkerUtils.getSettings();

    const site = getCurrentSite();
    if (site !== null) {
      if (document.querySelector("#wnp-injected") === null) {
        const script = document.createElement("script");
        script.id = "wnp-injected";
        script.src = chrome.runtime.getURL("injected.js");
        document.documentElement.appendChild(script);
      }
    }
  },
  sendMessage: <T>({ event, data }: { event: string; data?: any }): Promise<T> =>
    new Promise((resolve) => {
      const id = randomToken();
      const listener = (e: any) => {
        if (e.data.type === "wnp-response" && e.data.id === id) {
          resolve(e.data.value);
          window.removeEventListener("message", listener);
        }
      };
      window.addEventListener("message", listener);
      window.postMessage({ id, type: "wnp-message", event, data }, "*");
    }),
  getYouTubeInfo: () => ContentUtils.sendMessage<YouTubeInfo>({ event: "getYouTubeInfo" }),
  setYouTubeVolume: (volume: number) => ContentUtils.sendMessage({ event: "setYouTubeVolume", data: volume }),
  getYouTubeMusicVolume: () => ContentUtils.sendMessage<number>({ event: "getYouTubeMusicVolume" }),
  setYouTubeMusicVolume: (volume: number) => ContentUtils.sendMessage({ event: "setYouTubeMusicVolume", data: volume }),
  seekNetflix: (time: number) => ContentUtils.sendMessage({ event: "seekNetflix", data: time }),
  getNetflixInfo: () => ContentUtils.sendMessage<NetflixInfo>({ event: "getNetflixInfo" }),
  getVKInfo: () => ContentUtils.sendMessage<VKInfo>({ event: "getVKInfo" }),
  setVKState: (state: StateMode) => ContentUtils.sendMessage({ event: "setVKState", data: state }),
  skipVKPrevious: () => ContentUtils.sendMessage({ event: "skipVKPrevious" }),
  skipVKNext: () => ContentUtils.sendMessage({ event: "skipVKNext" }),
  setVKPosition: (time: number) => ContentUtils.sendMessage({ event: "setVKPosition", data: time }),
  setVKVolume: (volume: number) => ContentUtils.sendMessage({ event: "setVKVolume", data: volume }),
  toggleVKRepeatMode: () => ContentUtils.sendMessage({ event: "toggleVKRepeatMode" }),
  toggleVKShuffleActive: () => ContentUtils.sendMessage({ event: "toggleVKShuffleActive" }),
};

export const getCurrentSite = (): Site | null => {
  const sites = [
    AppleMusic,
    Bandcamp,
    Deezer,
    Invidious,
    Jellyfin,
    Kick,
    Navidrome,
    Netflix,
    Pandora,
    Plex,
    RadioAddict,
    Soundcloud,
    Spotify,
    Tidal,
    Twitch,
    VK,
    YandexMusic,
    YouTube,
    YouTubeEmbed,
    YouTubeMusic,
  ];
  const settings = ContentUtils.getSettings();

  let match = false;
  let currentSite = null;
  for (const site of sites) {
    if (site.match()) {
      match = true;
      if (!settings.disabledSites.includes(site.info.playerName())) currentSite = site;
    }
  }

  // Only apply generic if no supported site matched, ignoring disabled sites.
  // This is so that generic won't load on YouTube when the user disabled YouTube in the settings.
  if (!match && Generic.match()) currentSite = Generic;

  if (currentSite && !currentSite.isInitialized) {
    currentSite.isInitialized = true;
    currentSite.init?.();
  }

  return currentSite;
};

const mediaInfoCache = new Map<string, any>();
let sendFullMediaInfo = false;
export const setSendFullMediaInfo = (value: boolean) => (sendFullMediaInfo = value);
export const getMediaInfo = (): Partial<MediaInfo> | null => {
  const site = getCurrentSite();
  const mediaInfo: Partial<MediaInfo> = {};
  let mediaInfoChanged = false;

  if (!site || !site.ready()) return null;

  const values: (keyof SiteInfo)[] = [
    "playerName",
    "state",
    "title",
    "artist",
    "album",
    "coverUrl",
    "durationSeconds",
    "positionSeconds",
    "volume",
    "rating",
    "repeatMode",
    "shuffleActive",
  ];
  for (const key of values) {
    let value = site.info[key]?.();
    // For numbers, round it to an integer
    if (typeof value === "number") value = Math.round(value);
    // Trim strings
    else if (typeof value === "string") value = value.trim();
    // Title and artist sanitation
    if (key === "title") value = sanitizeTitle(value as string, sanitizeArtist(site.info.artist()));
    if (key === "artist") value = sanitizeArtist(value as string);
    if (value !== null && value !== undefined && mediaInfoCache.get(key) !== value) {
      if (key === "state" || key === "title" || (key === "volume" && (mediaInfoCache.get("state") || StateMode.STOPPED) === StateMode.PLAYING)) {
        const timestamp = value.toString().length > 0 ? Date.now() : 0;
        mediaInfo.timestamp = timestamp;
        mediaInfoCache.set("timestamp", timestamp);
      }
      (mediaInfo[key] as any) = value;
      mediaInfoCache.set(key, value);
      mediaInfoChanged = true;
    }
  }

  const playerControls = JSON.stringify({
    supports_play_pause: site.events.setState !== null,
    supports_skip_previous: site.canSkipPrevious(),
    supports_skip_next: site.canSkipNext(),
    supports_set_position: site.events.setPositionSeconds !== null || site.events.setPositionPercentage !== null,
    supports_set_volume: site.events.setVolume !== null,
    supports_toggle_repeat_mode: site.events.toggleRepeatMode !== null,
    supports_toggle_shuffle_active: site.events.toggleShuffleActive !== null,
    supports_set_rating: site.events.setRating !== null,
    rating_system: site.ratingSystem,
  });

  if (mediaInfoCache.get("playerControls") !== playerControls) {
    mediaInfo.playerControls = playerControls;
    mediaInfoCache.set("playerControls", playerControls);
    mediaInfoChanged = true;
  }

  if (sendFullMediaInfo) {
    sendFullMediaInfo = false;
    return Object.fromEntries(mediaInfoCache);
  }

  if (mediaInfoChanged) return mediaInfo;
  else return null;
};

export const ratingUtils = {
  like: (rating: number, site: Site, { toggleLike }: { toggleLike: () => void }) => {
    if (rating >= 3 && site.info.rating() !== 5) toggleLike();
    else if (rating < 3 && site.info.rating() === 5) toggleLike();
  },
  likeDislike: (rating: number, site: Site, { toggleLike, toggleDislike }: { toggleLike: () => void; toggleDislike: () => void }) => {
    if (rating === 0 && site.info.rating() === 5) return toggleLike();
    else if (rating === 0 && site.info.rating() === 1) return toggleDislike();

    if (rating >= 3 && site.info.rating() !== 5) toggleLike();
    else if (rating < 3 && site.info.rating() !== 1) toggleDislike();
  },
};

function sanitizeTitle(title: string, artist: string) {
  if (typeof title !== "string" || typeof artist !== "string") return "";
  // TODO: maybe one day
  return title;
}

function sanitizeArtist(artist: string) {
  if (typeof artist !== "string") return "";
  artist.replace(" - Topic", "");
  return artist;
}
