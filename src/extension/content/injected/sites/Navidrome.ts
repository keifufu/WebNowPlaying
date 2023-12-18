import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, ratingUtils } from "../utils";

const getPlayer = () => document.querySelector("audio");
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const Navidrome: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector("audio"),
  info: createSiteInfo({
    name: () => "Navidrome",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const player = getPlayer();
      if (!player) return StateMode.STOPPED;
      return player.paused ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => getPlayer()?.currentTime ?? 0,
    duration: () => getPlayer()?.duration ?? 0,
    volume: () => (getPlayer()?.volume ?? 1) * 100,
    rating: () => {
      const el = document.querySelector(".player-content > button path");
      const favPath =
        "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
      if (el?.getAttribute("d") === favPath) return 5;
      return 0;
    },
    repeat: () => {
      const el = document.querySelector(".group.loop-btn svg path");
      const repeatNonePath = "M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z";
      const repeatAllPath = "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z";
      const repeatOnePath = "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z";
      if (el?.getAttribute("d") === repeatNonePath) return Repeat.NONE;
      if (el?.getAttribute("d") === repeatAllPath) return Repeat.ALL;
      if (el?.getAttribute("d") === repeatOnePath) return Repeat.ONE;
      return Repeat.NONE;
    },
    shuffle: () => {
      const el = document.querySelector(".group.loop-btn svg path");
      const shufflePath =
        "M4 9h3.5c.736 0 1.393.391 1.851 1.001.325-.604.729-1.163 1.191-1.662-.803-.823-1.866-1.339-3.042-1.339h-3.5c-.553 0-1 .448-1 1s.447 1 1 1zM11.685 12.111c.551-1.657 2.256-3.111 3.649-3.111h1.838l-1.293 1.293c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l3.707-3.707-3.707-3.707c-.391-.391-1.023-.391-1.414 0s-.391 1.023 0 1.414l1.293 1.293h-1.838c-2.274 0-4.711 1.967-5.547 4.479l-.472 1.411c-.641 1.926-2.072 3.11-2.815 3.11h-2.5c-.553 0-1 .448-1 1s.447 1 1 1h2.5c1.837 0 3.863-1.925 4.713-4.479l.472-1.41zM15.879 13.293c-.391.391-.391 1.023 0 1.414l1.293 1.293h-2.338c-1.268 0-2.33-.891-2.691-2.108-.256.75-.627 1.499-1.09 2.185.886 1.162 2.243 1.923 3.781 1.923h2.338l-1.293 1.293c-.391.391-.391 1.023 0 1.414.195.195.451.293.707.293s.512-.098.707-.293l3.707-3.707-3.707-3.707c-.391-.391-1.023-.391-1.414 0z";
      if (el?.getAttribute("d") === shufflePath) return true;
      return false;
    },
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          getPlayerThrow().pause();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().play();
          break;
      }
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".group.prev-audio");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".group.next-audio");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      getPlayerThrow().currentTime = seconds;
    },
    setVolume: (volume) => {
      getPlayerThrow().volume = volume / 100;
    },
    setRating: (rating) => {
      ratingUtils.like(Navidrome, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".player-content > button");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const button = document.querySelector<HTMLButtonElement>(".group.loop-btn");
      if (!button) throw new EventError();

      const currentRepeat = Navidrome.info.repeat();
      const currentShuffle = Navidrome.info.shuffle();
      const currentState = currentShuffle ? 3 : currentRepeat === Repeat.ONE ? 2 : currentRepeat === Repeat.ALL ? 1 : 0;
      const map = {
        0: 0, // In order (shuffle off, repeat off)
        1: 1, // Repeat All
        2: 2, // Repeat One
        3: 3, // Shuffle
      };

      setMode(button, map, currentState, repeat === Repeat.ONE ? 2 : repeat === Repeat.ALL ? 1 : 0);
    },
    setShuffle: (shuffle) => {
      const button = document.querySelector<HTMLButtonElement>(".group.loop-btn");
      if (!button) throw new EventError();

      const currentRepeat = Navidrome.info.repeat();
      const currentShuffle = Navidrome.info.shuffle();
      const currentState = currentShuffle ? 3 : currentRepeat === Repeat.ONE ? 2 : currentRepeat === Repeat.ALL ? 1 : 0;
      const map = {
        0: 0, // In order (shuffle off, repeat off)
        1: 1, // Repeat All
        2: 2, // Repeat One
        3: 3, // Shuffle
      };

      setMode(button, map, currentState, shuffle ? 3 : 0);
    },
  },
  controls: () =>
    createDefaultControls(Navidrome, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

function setMode(button: HTMLButtonElement, map: any, currentState: number, targetState: number) {
  const currentModeIndex = map[currentState];
  const targetModeIndex = map[targetState];
  const len = Object.entries(map).length;
  const clickCount = (targetModeIndex - currentModeIndex + len) % len;

  let i = 0;
  const clickWithDelay = () => {
    if (i < clickCount) {
      button.click();
      i++;
      setTimeout(clickWithDelay, 100);
    }
  };

  clickWithDelay();
}

export default Navidrome;
