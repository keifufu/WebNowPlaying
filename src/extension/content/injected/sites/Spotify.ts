import { convertTimeToSeconds, getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, positionSecondsToPercent, ratingUtils, setRepeat, setStatePlayPauseButton } from "../utils";

const Spotify: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata,
  info: createSiteInfo({
    name: () => "Spotify",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const path = document.querySelectorAll(".player-controls__buttons button svg path")[3]?.getAttribute("d");
      if (!path) return StateMode.STOPPED;
      const playingPath =
        "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z";
      if (path === playingPath) return StateMode.PLAYING;
      else return StateMode.PAUSED;
    },
    position: () => convertTimeToSeconds(document.querySelector<HTMLElement>(".playback-bar > div")?.innerText ?? "0"),
    duration: () => convertTimeToSeconds(document.querySelectorAll<HTMLElement>(".playback-bar > div")[2]?.innerText ?? "0"),
    volume: () => {
      const volumeBar = document.querySelector<HTMLElement>('div[data-testid="volume-bar"] div[data-testid="progress-bar"]');
      if (!volumeBar) return 100;
      return parseInt(volumeBar.style.getPropertyValue("--progress-bar-transform")?.replace("%", "") ?? "100");
    },
    rating: () => (document.querySelector(".control-button-heart")?.getAttribute("aria-checked") === "true" ? 5 : 0),
    repeat: () => {
      const button = document.querySelectorAll(".player-controls__buttons button")[4];
      const state = button?.getAttribute("aria-checked");
      if (state === "true") return Repeat.ALL;
      if (state === "mixed") return Repeat.ONE;
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector(".player-controls__buttons button")?.getAttribute("aria-checked") === "true",
  }),
  events: {
    setState: (state) => {
      const button = document.querySelectorAll<HTMLButtonElement>(".player-controls__buttons button")[2];
      if (!button) throw new Event("Failed to find button");
      const currentState = Spotify.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelectorAll<HTMLButtonElement>(".player-controls__buttons button")[1];
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelectorAll<HTMLButtonElement>(".player-controls__buttons button")[3];
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(Spotify, seconds);
      const el = document.querySelector(".playback-bar > div > div");
      if (!el) throw new EventError();

      const loc = el.getBoundingClientRect();
      const position = percent * loc.width;

      el.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + position,
          clientY: loc.top + loc.height / 2,
        }),
      );
      el.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + position,
          clientY: loc.top + loc.height / 2,
        }),
      );
    },
    setVolume: (volume) => {
      const el = document.querySelector<HTMLElement>('div[data-testid="volume-bar"] div[data-testid="progress-bar"]');
      if (!el) throw new EventError();

      const loc = el.getBoundingClientRect();
      const vol = (volume / 100) * loc.width;

      el.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + vol,
          clientY: loc.top + loc.height / 2,
        }),
      );
      el.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: loc.left + vol,
          clientY: loc.top + loc.height / 2,
        }),
      );
    },
    setRating: (rating) => {
      ratingUtils.like(Spotify, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".control-button-heart");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = Spotify.info.repeat();
      if (currentRepeat === repeat) return;

      const button = document.querySelectorAll<HTMLButtonElement>(".player-controls__buttons button")[4];
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (Spotify.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>(".player-controls__buttons button");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(Spotify, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default Spotify;
