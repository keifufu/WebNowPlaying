import { convertTimeToSeconds } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import {
  createDefaultControls,
  createSiteInfo,
  notDisabled,
  positionSecondsToPercent,
  ratingUtils,
  setRepeat,
  setStatePlayPauseButton,
} from "../utils";

// Tidal is paid-only now, maybe it has a trial.
// I am not going to create a new trial account every time.

let lastKnownVolume = 100;
const Tidal: Site = {
  debug: {},
  init: null,
  ready: () => !!document.querySelector("#footerPlayer"),
  info: createSiteInfo({
    name: () => "Tidal",
    title: () => document.querySelector<HTMLElement>("#footerPlayer span")?.innerText ?? "",
    artist: () => document.querySelectorAll<HTMLElement>("#footerPlayer span")[1]?.innerText ?? "",
    // This will sometimes show the playlist instead of the album, doesn't seem like I can do much about it
    // using textContent instead of innerText because innerText is all capitalized
    album: () => document.querySelectorAll("#footerPlayer a")[2]?.textContent ?? "",
    cover: () => {
      const src = document.querySelector<HTMLImageElement>("#footerPlayer img")?.src.split("/").slice(0, -1).join("/");
      if (src) return src + "/1280x1280.jpg";
      return "";
    },
    state: () => {
      const button = document.querySelectorAll("#playbackControlBar button")[2];
      const playButtonDataType = button?.getAttribute("data-type");
      if (playButtonDataType === "button__pause") return StateMode.PAUSED;
      if (playButtonDataType === "button__play") return StateMode.PLAYING;
      return StateMode.STOPPED;
    },
    position: () => convertTimeToSeconds(document.querySelector<HTMLElement>("#footerPlayer time")?.innerText ?? "0"),
    duration: () => convertTimeToSeconds(document.querySelectorAll<HTMLElement>("#footerPlayer time")[1]?.innerText ?? "0"),
    volume: () => {
      const el = document.querySelector<HTMLInputElement>("#nativeRange input");
      if (!el) return lastKnownVolume;
      lastKnownVolume = parseInt(el.value);
      return lastKnownVolume;
    },
    rating: () => (document.querySelector("#footerPlayer .favorite-button")?.getAttribute("aria-checked") === "true" ? 5 : 0),
    repeat: () => {
      const button = document.querySelectorAll("#playbackControlBar button")[4];
      const repeatButtonDataType = button?.getAttribute("data-type");
      if (repeatButtonDataType === "button__repeatAll") return Repeat.ALL;
      if (repeatButtonDataType === "button__repeatSingle") return Repeat.ONE;
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector("#playbackControlBar button")?.getAttribute("aria-checked") === "true",
  }),
  events: {
    setState: (state) => {
      const button = document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[2];
      if (!button) throw new Event("Failed to find button");
      const currentState = Tidal.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[1];
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[3];
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(Tidal, seconds);
      const el = document.querySelector('div[data-test="interaction-layer"]');
      if (!el) throw new EventError();

      const loc = el.getBoundingClientRect();
      const position = percent * loc.width;

      el.dispatchEvent(
        new MouseEvent("mousedown", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + loc.height / 2,
        }),
      );
      el.dispatchEvent(
        new MouseEvent("mouseup", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + loc.height / 2,
        }),
      );
    },
    setVolume: null,
    setRating: (rating) => {
      ratingUtils.like(Tidal, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>("#footerPlayer .favorite-button");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = Tidal.info.repeat();
      if (currentRepeat === repeat) return;

      const button = document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[4];
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (Tidal.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>("#playbackControlBar button");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(Tidal, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: notDisabled(document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[1]),
      canSkipNext: notDisabled(document.querySelectorAll<HTMLButtonElement>("#playbackControlBar button")[3]),
    }),
};

export default Tidal;
