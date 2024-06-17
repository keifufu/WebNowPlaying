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

const YandexMusic: Site = {
  debug: {},
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector(".player-controls__btn_play"),
  info: createSiteInfo({
    name: () => "Yandex Music",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => {
      const el = document.querySelector(".player-controls__btn_play");
      if (!el) return StateMode.STOPPED;
      return el.classList.contains("d-icon_play") ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => convertTimeToSeconds(document.querySelector<HTMLElement>(".progress__bar .progress__left")?.innerText ?? "0"),
    duration: () => convertTimeToSeconds(document.querySelector<HTMLElement>(".progress__bar .progress__right")?.innerText ?? "0"),
    volume: () => (document.querySelector("volume__icon")?.classList.contains("volume__icon_mute") ? 0 : 100),
    rating: () => (document.querySelector(".player-controls__track-controls .d-icon_heart-full") ? 5 : 0),
    repeat: () => {
      const el = document.querySelector(".player-controls__btn_repeat");
      if (el?.classList.contains("player-controls__btn_repeat_state1")) return Repeat.ALL;
      if (el?.classList.contains("player-controls__btn_repeat_state2")) return Repeat.ONE;
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector(".player-controls__btn_shuffle")?.classList.contains("player-controls__btn_on") ?? false,
  }),
  events: {
    setState: (state) => {
      const button = document.querySelector<HTMLButtonElement>(".player-controls__btn_play");
      if (!button) throw new Event("Failed to find button");
      const currentState = YandexMusic.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".d-icon_track-prev");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".d-icon_track-next");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(YandexMusic, seconds);
      const el = document.querySelector(".progress__progress");
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
      const currVolume = YandexMusic.info.volume();
      if ((currVolume === 0 && volume > 0) || (currVolume === 100 && volume < 100)) {
        const button = document.querySelector<HTMLButtonElement>(".volume__btn");
        if (!button) throw new EventError();
        button.click();
      }
    },
    setRating: (rating) => {
      ratingUtils.likeDislike(YandexMusic, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".player-controls__btn .d-icon_heart");
          if (!button) throw new EventError();
          button.click();
        },
        toggleDislike: () => {
          const button = document.querySelector<HTMLButtonElement>(".player-controls__btn .d-icon_heart-full");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const currentRepeat = YandexMusic.info.repeat();
      if (currentRepeat === repeat) return;
      const button = document.querySelector<HTMLButtonElement>(".player-controls__btn_repeat");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (YandexMusic.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>(".player-controls__btn_shuffle");
      if (!button) throw new EventError();
      button.click();
    },
  },
  controls: () =>
    createDefaultControls(YandexMusic, {
      ratingSystem: RatingSystem.LIKE_DISLIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: notDisabled(document.querySelector<HTMLButtonElement>(".d-icon_track-prev")),
      canSkipNext: notDisabled(document.querySelector<HTMLButtonElement>(".d-icon_track-next")),
    }),
};

export default YandexMusic;
