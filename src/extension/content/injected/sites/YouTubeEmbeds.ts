import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => document.querySelector<any>("#movie_player");
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

let _shuffle = false;

const YouTubeEmbeds: Site = {
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
          getPlayerThrow().stopVideo();
          break;
        case StateMode.PAUSED:
          getPlayerThrow().pauseVideo();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().playVideo();
          break;
      }
    },
    skipPrevious: () => {
      getPlayerThrow().previousVideo();
    },
    skipNext: () => {
      getPlayerThrow().nextVideo();
    },
    setPosition: (seconds) => {
      getPlayerThrow().seekTo(seconds);
    },
    setVolume: (volume) => {
      getPlayerThrow().setVolume(volume);
    },
    setRating: null,
    setRepeat: (repeat) => {
      const video = document.querySelector("video");
      if (!video) throw new EventError();
      video.loop = repeat === Repeat.ONE;
    },
    setShuffle: (shuffle) => {
      _shuffle = shuffle;
      // Woah shuffle actually works here
      getPlayerThrow().setShuffle(shuffle);
    },
  },
  controls: () =>
    createDefaultControls(YouTubeEmbeds, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
    }),
};

export default YouTubeEmbeds;
