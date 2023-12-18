import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const w = window as any;

const Invidious: Site = {
  init: null,
  ready: () => !!document.querySelector("video"),
  info: createSiteInfo({
    name: () => "Invidious",
    title: () => w.player_data.title ?? "",
    artist: () => document.querySelector<HTMLElement>("#channel-name")?.innerText ?? "",
    album: () => document.querySelector<HTMLElement>("#playlist a")?.innerText ?? "",
    cover: () => {
      const poster = w.player.poster();
      if (poster) return document.location.origin + poster;
      return "";
    },
    state: () => (w.player.paused() ? StateMode.PAUSED : w.player.paused() === false ? StateMode.PLAYING : StateMode.STOPPED),
    position: () => w.player.currentTime() ?? 0,
    duration: () => w.player.duration() ?? 0,
    volume: () => w.player.volume() * 100 ?? 100,
    rating: () => 0,
    repeat: () => (w.player.loop() ? Repeat.ONE : Repeat.NONE),
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          w.stop();
          break;
        case StateMode.PAUSED:
          w.player.pause();
          break;
        case StateMode.PLAYING:
          w.player.play();
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
    setPosition: (seconds) => {
      w.player.currentTime(seconds);
    },
    setVolume: (volume) => {
      w.player.volume(volume / 100);
    },
    setRating: null,
    setRepeat: (repeat) => {
      w.player.loop(repeat === Repeat.ONE);
    },
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
