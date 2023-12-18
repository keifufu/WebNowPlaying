import { capitalize, convertTimeToSeconds } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, positionSecondsToPercent, ratingUtils, setRepeat, setStatePlayPauseButton } from "../utils";

// This site isn't available in Germany so if it breaks I can't really do anything about it.
// This is missing:
// - Volume control
// - canSkipPrevious & canSkipNext
// - any amount of testing

const Pandora: Site = {
  init: null,
  ready: () =>
    !!document.querySelector(".Tuner__Audio__TrackDetail__title") && !!document.querySelectorAll(".VolumeDurationControl__Duration span")[2],
  info: createSiteInfo({
    name: () => "Pandora",
    title: () => document.querySelector<HTMLElement>(".Tuner__Audio__TrackDetail__title")?.innerText ?? "",
    artist: () => document.querySelector<HTMLElement>(".Tuner__Audio__TrackDetail__artist")?.innerText ?? "",
    album: () => {
      const albumName = document.querySelector<HTMLElement>(".nowPlayingTopInfo__current__albumName")?.innerText;
      if (albumName) return albumName;
      const href = document.querySelector<HTMLAnchorElement>("Tuner__Audio__TrackDetail__title")?.href;
      if (href) return capitalize(href.replace("://www.pandora.com/artist/", "").split("/")[1].replaceAll("-", " "));
      return "";
    },
    cover: () => {
      const cover = document.querySelector<HTMLImageElement>(".nowPlayingTopInfo__artContainer__art img")?.src;
      if (cover) return cover;
      const el = document.querySelector<HTMLImageElement>(".ImageLoader img, .nowPlayingTopInfo__artContainer img");
      if (el) return `${el.src.split("/").slice(0, -1).join("/")}/500W_500H.jpg`;
      return "";
    },
    state: () => {
      if (document.querySelector(".StillListeningBody")) return StateMode.STOPPED;
      const el = document.querySelector(".PlayButton__Icon path");
      if (!el) return StateMode.STOPPED;
      return el.getAttribute("d")?.includes("22.5v-21l16.5") ? StateMode.PAUSED : StateMode.PLAYING;
    },
    position: () => convertTimeToSeconds(document.querySelector<HTMLElement>("VolumeDurationControl__Duration span")?.innerText ?? "0"),
    duration: () => convertTimeToSeconds(document.querySelectorAll<HTMLElement>("VolumeDurationControl__Duration span")[2]?.innerText ?? "0"),
    volume: () => 100,
    rating: () => {
      const thumbsUp = document.querySelector(".ThumbsUpButton")?.getAttribute("aria-checked") === "true";
      if (thumbsUp) return 5;
      const thumbsDown = document.querySelector(".ThumbsDownButton")?.getAttribute("aria-checked") === "true";
      if (thumbsDown) return 1;
      return 0;
    },
    repeat: () => {
      const state = document.querySelector(".RepeatButton")?.getAttribute("aria-checked");
      if (state === "true") return Repeat.ALL;
      if (state === "mixed") return Repeat.ONE;
      return Repeat.NONE;
    },
    shuffle: () => document.querySelector(".ShuffleButton")?.getAttribute("aria-checked") === "true",
  }),
  events: {
    setState: (state) => {
      const button = document.querySelector<HTMLButtonElement>(".PlayButton");
      if (!button) throw new Event("Failed to find button");
      const currentState = Pandora.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelector<HTMLButtonElement>(".ReplayButton, .Tuner__Control__SkipBack__Button");
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelector<HTMLButtonElement>(".SkipButton, .Tuner__Control__SkipForward__Button");
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(Pandora, seconds);
      const el = document.querySelector(".TunerProgress__HitBox");
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
      ratingUtils.likeDislike(Pandora, rating, {
        toggleLike: () => {
          const button = document.querySelector<HTMLButtonElement>(".ThumbsUpButton");
          if (!button) throw new EventError();
          button.click();
        },
        toggleDislike: () => {
          const button = document.querySelector<HTMLButtonElement>(".ThumbsDownButton");
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const button = document.querySelector<HTMLButtonElement>(".RepeatButton");
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      const currentRepeat = Pandora.info.repeat();
      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (Pandora.info.shuffle() === shuffle) return;
      const button = document.querySelector<HTMLButtonElement>(".ShuffleButton");
      if (!button) throw new EventError();
      button.click();
    },
  },

  controls: () =>
    createDefaultControls(Pandora, {
      ratingSystem: RatingSystem.LIKE_DISLIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default Pandora;
