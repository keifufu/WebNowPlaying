import { convertTimeToSeconds, getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";
import { ratingUtils } from "../utils";

const site: Site = {
  match: () => window.location.hostname === "open.spotify.com",
  ready: () =>
    navigator.mediaSession.metadata !== null &&
    querySelector<boolean, HTMLElement>("(.player-controls__buttons button svg path)[3]", (el) => true, false),
  ratingSystem: RatingSystem.LIKE,
  info: {
    playerName: () => "Spotify",
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () =>
      querySelectorReport<StateMode, HTMLButtonElement>(
        "(.player-controls__buttons button svg path)[3]",
        (el) => {
          const path = el.getAttribute("d");
          const playingPath =
            "M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z";
          if (path === playingPath) return StateMode.PLAYING;
          return StateMode.PAUSED;
        },
        StateMode.PAUSED,
        "state"
      ),
    title: () => navigator.mediaSession.metadata?.title || "",
    artist: () => navigator.mediaSession.metadata?.artist || "",
    album: () => navigator.mediaSession.metadata?.album || "",
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () =>
      querySelectorReport<number, HTMLElement>("(.playback-bar > div)[2]", (el) => convertTimeToSeconds(el.innerText), 0, "durationSeconds"),
    positionSeconds: () =>
      querySelectorReport<number, HTMLElement>(".playback-bar > div", (el) => convertTimeToSeconds(el.innerText), 0, "positionSeconds"),
    volume: () =>
      querySelectorReport<number, HTMLElement>(
        ".volume-bar__slider-container > div > div",
        (el) => parseFloat(el.style.getPropertyValue("--progress-bar-transform").replace("%", "")),
        100,
        "volume"
      ),
    rating: () =>
      querySelectorReport<number, HTMLButtonElement>(
        ".control-button-heart",
        (el) => (el.getAttribute("aria-checked") === "true" ? 5 : 0),
        0,
        "rating"
      ),
    repeatMode: () =>
      querySelectorReport<RepeatMode, HTMLButtonElement>(
        "(.player-controls__buttons button)[4]",
        (el) => {
          const state = el.getAttribute("aria-checked");
          if (state === "true") return RepeatMode.ALL;
          if (state === "mixed") return RepeatMode.ONE;
          return RepeatMode.NONE;
        },
        RepeatMode.NONE,
        "repeatMode"
      ),
    shuffleActive: () =>
      querySelectorReport<boolean, HTMLButtonElement>(
        ".player-controls__buttons button",
        (el) => el.getAttribute("aria-checked") === "true",
        false,
        "shuffleActive"
      ),
  },
  // We can never tell if we can't skip previous as spotify will just go to the beginning of the song
  // I mean, we could read the queue but I can't be bothered
  canSkipPrevious: () => true,
  // If we are at the end of a queue, pressing next will also just go to the beginning again
  canSkipNext: () => true,
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>("(.player-controls__buttons button)[2]", (el) => el.click(), "setState");
    },
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>("(.player-controls__buttons button)[1]", (el) => el.click(), "skipPrevious"),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>("(.player-controls__buttons button)[3]", (el) => el.click(), "skipNext"),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>(
        ".playback-bar > div > div",
        (el) => {
          const loc = el.getBoundingClientRect();
          const position = positionPercentage * loc.width;

          el.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
        },
        "setPositionPercentage"
      );
    },
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLElement>(
        ".volume-bar > div > div > div",
        (el) => {
          const loc = el.getBoundingClientRect();
          const vol = (volume / 100) * loc.width;

          el.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: loc.left + vol,
              clientY: loc.top + loc.height / 2,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: loc.left + vol,
              clientY: loc.top + loc.height / 2,
            })
          );
        },
        "setVolume"
      );
    },
    toggleRepeatMode: () =>
      querySelectorEventReport<HTMLButtonElement>("(.player-controls__buttons button)[4]", (el) => el.click(), "toggleRepeatMode"),
    toggleShuffleActive: () =>
      querySelectorEventReport<HTMLButtonElement>(".player-controls__buttons button", (el) => el.click(), "toggleShuffleActive"),
    setRating: (rating: number) => {
      ratingUtils.like(rating, site, {
        toggleLike: () => {
          querySelectorEventReport<HTMLButtonElement>(".control-button-heart", (el) => el.click(), "setRating");
        },
      });
    },
  },
};

export default site;
