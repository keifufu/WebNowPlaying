import { EventError, EventResult, Player, Site, StateMode, defaultPlayer } from "../../types";

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
import SoundCloud from "./sites/SoundCloud";
import Spotify from "./sites/Spotify";
import Tidal from "./sites/Tidal";
import Twitch from "./sites/Twitch";
import VK from "./sites/VK";
import YandexMusic from "./sites/YandexMusic";
import YouTube from "./sites/YouTube";
import YouTubeEmbeds from "./sites/YouTubeEmbeds";
import YouTubeMusic from "./sites/YouTubeMusic";
import { InjectedUtils } from "./utils";

let reqCount = 0;
let lastState = StateMode.STOPPED;
let firstRequest = false;

const sites = [
  AppleMusic,
  Bandcamp,
  Deezer,
  Generic,
  Invidious,
  Jellyfin,
  Kick,
  Navidrome,
  Netflix,
  Pandora,
  Plex,
  RadioAddict,
  SoundCloud,
  Spotify,
  Tidal,
  Twitch,
  VK,
  YandexMusic,
  YouTube,
  YouTubeEmbeds,
  YouTubeMusic,
];
(window as any)._wnp = {};
sites.forEach((site) => {
  (window as any)._wnp[site.info.name().replace(" ", "")] = site;
});

InjectedUtils.init();
window.addEventListener("message", (msg: any) => {
  if (msg.data.type !== "wnp-message") return;
  const { messageId, siteName, func, args } = msg.data;
  const site: Site | undefined = sites.find((site) => site.info.name() == siteName);
  if (!site) return sendResponse(messageId, EventResult.FAILED);

  try {
    switch (func) {
      case "init":
        if (site.init) {
          site.init();
        }
        break;
      case "getPlayerOptimized": {
        // If site isn't ready, don't bother querying.
        if (!site.ready()) return sendResponse(messageId, defaultPlayer);
        const state = site.info.state();
        if (state != lastState || state == StateMode.PLAYING || firstRequest) {
          // If PLAYING or state changed OR this is the first request, query all as usual
          lastState = state;
          firstRequest = false;
          return sendResponse(messageId, getPlayer(site));
        } else {
          // otherwise, only query every 4th request (1s)
          reqCount++;
          if (reqCount < 4) return sendResponse(messageId, null);
          reqCount = 0;
          sendResponse(messageId, getPlayer(site));
        }
        break;
      }
      case "getPlayer":
        sendResponse(messageId, getPlayer(site));
        break;
      default:
        (site.events as any)[func](args);
        sendResponse(messageId, EventResult.SUCCEEDED);
        break;
    }
  } catch (err) {
    if (err instanceof EventError) {
      sendResponse(messageId, EventResult.FAILED);
    } else {
      console.error("[WebNowPlaying] Failed to handle event error (2)", err);
      sendResponse(messageId, EventResult.FAILED);
    }
  }
});

function getPlayer(site: Site) {
  const player: Player = {
    ...defaultPlayer,
    name: site.info.name(),
    title: site.info.title(),
    artist: site.info.artist(),
    album: site.info.album(),
    cover: site.info.cover(),
    state: site.info.state(),
    position: site.info.position(),
    duration: site.info.duration(),
    volume: site.info.volume(),
    rating: site.info.rating(),
    repeat: site.info.repeat(),
    shuffle: site.info.shuffle(),
    ratingSystem: site.controls().ratingSystem,
    availableRepeat: site.controls().availableRepeat,
    canSetState: site.controls().canSetState,
    canSkipPrevious: site.controls().canSkipPrevious,
    canSkipNext: site.controls().canSkipNext,
    canSetPosition: site.controls().canSetPosition,
    canSetVolume: site.controls().canSetVolume,
    canSetRating: site.controls().canSetRating,
    canSetRepeat: site.controls().canSetRepeat,
    canSetShuffle: site.controls().canSetShuffle,
  };
  return player;
}

function sendResponse(messageId: string, returnValue: EventResult | Player | null) {
  window.postMessage({
    type: "wnp-response",
    messageId,
    returnValue,
  });
}
