import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => document.querySelector<any>("#movie_player");
let _shuffle = false;

const YouTubeEmbeds: Site = {
  debug: {
    getPlayer,
  },
  init: null,
  ready: () =>
    !!document.querySelector<HTMLElement>(".ytp-title-text")?.innerText.length &&
    !document.querySelector(".html5-video-player")?.classList.contains("unstarted-mode"),
  info: createSiteInfo({
    name: () => "YouTube Embeds",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const state = getPlayer()?.getPlayerState();
      switch (state) {
        case 1:
          return StateMode.PLAYING;
        case 2:
          return StateMode.PAUSED;
        default:
          return StateMode.STOPPED;
      }
    },
    position: () => getPlayer()?.getCurrentTime() ?? 0,
    duration: () => getPlayer()?.getDuration() ?? 0,
    volume: () => getPlayer()?.getVolume() ?? 100,
    rating: () => 0,
    repeat: () => {
      const video = document.querySelector("video");
      if (!video || !video.loop) return Repeat.NONE;
      return Repeat.ONE;
    },
    shuffle: () => _shuffle,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          _throw(getPlayer()?.stopVideo)();
          break;
        case StateMode.PAUSED:
          _throw(getPlayer()?.pauseVideo)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.playVideo)();
          break;
      }
    },
    skipPrevious: () => _throw(getPlayer()?.previousVideo)(),
    skipNext: () => _throw(getPlayer()?.nextVideo)(),
    setPosition: (seconds) => _throw(getPlayer()?.seekTo)(seconds),
    setVolume: (volume) => _throw(getPlayer()?.setVolume)(volume),
    setRating: null,
    setRepeat: (repeat) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.loop = repeat === Repeat.ONE;
    },
    setShuffle: (shuffle) => {
      _shuffle = shuffle;
      // Woah shuffle actually works here
      _throw(getPlayer()?.setShuffle)(shuffle);
    },
  },
  controls: () =>
    createDefaultControls(YouTubeEmbeds, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
    }),
};

export default YouTubeEmbeds;
