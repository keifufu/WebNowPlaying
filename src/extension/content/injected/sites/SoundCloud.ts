import { convertTimeToSeconds, getMediaSessionCover } from "../../../../utils/misc";
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

const SoundCloud: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata,
  info: createSiteInfo({
    name: () => "Soundcloud",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => (navigator.mediaSession.playbackState === "playing" ? StateMode.PLAYING : StateMode.PAUSED),
    position: () => convertTimeToSeconds(document.querySelectorAll<HTMLElement>(".playbackTimeline__timePassed > span")[1]?.innerText ?? "0"),
    duration: () => convertTimeToSeconds(document.querySelectorAll<HTMLElement>(".playbackTimeline__duration > span")[1]?.innerText ?? "0"),
    volume: () => {
      const p = document.querySelector(".volume__sliderProgress")?.getBoundingClientRect().height;
      const h = document.querySelector(".volume__sliderBackground")?.getBoundingClientRect().height;
      if (!p || !h) return 100;
      return (p / h) * 100;
    },
    rating: () => (document.querySelector(".playbackSoundBadge__like")?.className.includes("selected") ? 5 : 0),
    repeat: () => {
      if (document.querySelector(".m-one")) return Repeat.ONE;
      if (document.querySelector(".m-all")) return Repeat.ALL;
      return Repeat.NONE;
    },
    shuffle: () => !!document.querySelector(".m-shuffling"),
  }),
  events: {
    setState: (state) => {
      const button = document.querySelector<HTMLButtonElement>(".playControl");
      if (!button) throw new Event("Failed to find button");
      const currentState = SoundCloud.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".skipControl__previous");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".skipControl__next");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(SoundCloud, seconds);
      const el = document.querySelector(".playbackTimeline__progressWrapper");
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
    setVolume: (volume) => {
      const el = document.querySelector(".volume");
      if (!el) throw new EventError();
      el.dispatchEvent(
        new MouseEvent("mouseover", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      );
      el.dispatchEvent(
        new MouseEvent("mousemove", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        }),
      );

      let counter = 0;
      let vol = volume / 100;

      const volumeReadyTest = setInterval(() => {
        const el2 = document.querySelector(".volume.expanded.hover");
        if (!el2) throw new EventError();
        if (el2) {
          clearInterval(volumeReadyTest);
          const el3 = document.querySelector(".volume__sliderBackground");
          if (!el3) throw new EventError();
          const loc = el3.getBoundingClientRect();
          vol *= loc.height;

          el3.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + loc.width / 2,
              clientY: loc.bottom - vol + 5,
            }),
          );
          el3.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + loc.width / 2,
              clientY: loc.bottom - vol + 5,
            }),
          );

          const el4 = document.querySelector(".volume");
          if (!el4) throw new EventError();
          el4.dispatchEvent(
            new MouseEvent("mouseout", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0,
            }),
          );
        } else {
          counter += 1;
          if (counter > 10) {
            clearInterval(volumeReadyTest);
            throw new EventError();
          }
        }
      }, 25);
    },
    setRating: (rating) => {
      ratingUtils.like(SoundCloud, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".playbackSoundBadge__like");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = SoundCloud.info.repeat();
      if (currentRepeat === repeat) return;
      const button = document.querySelector<HTMLButtonElement>(".repeatControl");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 2,
        [Repeat.ONE]: 1,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (SoundCloud.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>(".shuffleControl");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(SoundCloud, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: notDisabled(document.querySelector<HTMLButtonElement>(".skipControl__previous")),
      canSkipNext: notDisabled(document.querySelector<HTMLButtonElement>(".skipControl__next")),
    }),
};

export default SoundCloud;
