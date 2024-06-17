import { convertTimeToSeconds } from "../../../../utils/misc";
import { Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => document.querySelector<HTMLVideoElement>("#video-holder video");

const Kick: Site = {
  debug: {
    getPlayer,
  },
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
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          _throw(getPlayer()?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.play)();
          break;
      }
    },
    skipPrevious: null,
    skipNext: null,
    setPosition: (seconds) => (_throw(getPlayer()).currentTime = seconds),
    setVolume: (volume) => {
      // broken
      const player = _throw(getPlayer());
      player.muted = false;
      player.volume = volume / 100;
    },
    setRating: null,
    setRepeat: (repeat) => (_throw(getPlayer()).loop = repeat === Repeat.ONE),
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Kick, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
    }),
};

export default Kick;
