import { convertTimeToSeconds } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => document.querySelector<HTMLVideoElement>("#video-holder video");
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const Kick: Site = {
  init: null,
  ready: () => !!document.querySelector("#video-holder video"),
  info: createSiteInfo({
    name: () => "Kick",
    title: () => document.querySelector<HTMLElement>(".stream-title")?.innerText ?? "",
    artist: () => document.querySelector<HTMLElement>(".stream-username > span")?.innerText ?? "",
    album: () => "",
    cover: () => document.querySelector<HTMLImageElement>("#main-view .profile-picture > img")?.src ?? "",
    state: () => {
      const player = getPlayer();
      if (!player) return StateMode.STOPPED;
      return player.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => {
      const player = getPlayer();
      if (!player) return 0;
      if (player.duration !== 1073741824) return player.currentTime;
      return convertTimeToSeconds(document.querySelector<HTMLElement>(".vjs-remaining-time")?.innerText ?? "0");
    },
    duration: () => {
      const player = getPlayer();
      if (!player) return 0;
      if (player.duration !== 1073741824) return player.duration;
      return convertTimeToSeconds(document.querySelector<HTMLElement>(".vjs-remaining-time")?.innerText ?? "0");
    },
    volume: () => (getPlayer()?.muted ? 0 : (getPlayer()?.volume ?? 1) * 100),
    rating: () => 0,
    repeat: () => (getPlayer()?.loop ? Repeat.ONE : Repeat.NONE),
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      const player = getPlayerThrow();
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          player.pause();
          break;
        case StateMode.PLAYING:
          player.play();
          break;
      }
    },
    skipPrevious: null,
    skipNext: null,
    setPosition: (seconds) => {
      getPlayerThrow().currentTime = seconds;
    },
    setVolume: (volume) => {
      const player = getPlayerThrow();
      player.muted = false;
      player.volume = volume / 100;
    },
    setRating: null,
    setRepeat: (repeat) => {
      getPlayerThrow().loop = repeat === Repeat.ONE;
    },
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Kick, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
    }),
};

export default Kick;
