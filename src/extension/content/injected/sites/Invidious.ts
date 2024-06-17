import { EventError, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => (window as any).player;
const getPlayerData = () => (window as any).player_data;

const Invidious: Site = {
  debug: {
    getPlayer,
    getPlayerData,
  },
  init: null,
  ready: () => !!document.querySelector("video"),
  info: createSiteInfo({
    name: () => "Invidious",
    title: () => getPlayerData()?.title ?? "",
    artist: () => document.querySelector<HTMLElement>("#channel-name")?.innerText ?? "",
    album: () => document.querySelector<HTMLElement>("#playlist a")?.innerText ?? "",
    cover: () => {
      const poster = getPlayer()?.poster?.();
      if (poster) return document.location.origin + poster;
      return "";
    },
    state: () => (getPlayer()?.paused?.() === true ? StateMode.PAUSED : getPlayer()?.paused?.() === false ? StateMode.PLAYING : StateMode.STOPPED),
    position: () => getPlayer()?.currentTime?.() ?? 0,
    duration: () => getPlayer()?.duration?.() ?? 0,
    volume: () => (getPlayer()?.volume?.() ?? 1) * 100,
    rating: () => 0,
    repeat: () => (getPlayer()?.loop?.() ? Repeat.ONE : Repeat.NONE),
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          _throw(getPlayer()?.stop)();
          break;
        case StateMode.PAUSED:
          _throw(getPlayer()?.pause)();
          break;
        case StateMode.PLAYING:
          _throw(getPlayer()?.play)();
          break;
      }
    },
    skipPrevious: () => {
      // go back in history if the previous url is from the same domain
      if (document.referrer.includes(window.location.host)) window.history.back();
    },
    skipNext: () => {
      const thumbnail = document.querySelector<HTMLButtonElement>(".thumbnail");
      if (!thumbnail) throw new EventError();
      thumbnail.click();
    },
    setPosition: (seconds) => _throw(getPlayer()?.currentTime)(seconds),
    setVolume: (volume) => _throw(getPlayer()?.volume)(volume),
    setRating: null,
    setRepeat: (repeat) => _throw(getPlayer()?.loop)(repeat === Repeat.ONE),
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Invidious, {
      availableRepeat: Repeat.NONE | Repeat.ONE,
      canSkipPrevious: document.referrer.includes("window.location.host"),
      canSkipNext: !!document.querySelector(".thumbnail"),
    }),
};

export default Invidious;
