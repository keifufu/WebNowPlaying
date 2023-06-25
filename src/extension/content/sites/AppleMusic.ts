import { getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";

// Repeat and shuffle on Apple Music don't update instantly, we click the button but it takes a few ms for info.repeat() to return the correct value

const site: Site = {
  match: () => window.location.hostname === "music.apple.com",
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLAudioElement>("audio", (el) => el !== null, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "Apple Music",
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () =>
      querySelectorReport<StateMode, HTMLAudioElement>(
        "audio",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      ),
    title: () => navigator.mediaSession.metadata?.title || "",
    artist: () => navigator.mediaSession.metadata?.artist || "",
    album: () => navigator.mediaSession.metadata?.album || "",
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => querySelectorReport<number, HTMLAudioElement>("audio", (el) => el.duration, 0, "durationSeconds"),
    positionSeconds: () => querySelectorReport<number, HTMLAudioElement>("audio", (el) => el.currentTime, 0, "positionSeconds"),
    volume: () => querySelectorReport<number, HTMLAudioElement>("audio", (el) => (el.muted ? 0 : el.volume * 100), 100, "volume"),
    rating: () => 0,
    repeatMode: () => {
      const repeatButton = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-repeat")
        ?.shadowRoot?.querySelector(".button--repeat");
      return repeatButton?.classList.contains("mode--0")
        ? RepeatMode.NONE
        : repeatButton?.classList.contains("mode--1")
        ? RepeatMode.ONE
        : RepeatMode.ALL;
    },
    shuffleActive: () => {
      const shuffleButton = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-shuffle")
        ?.shadowRoot?.querySelector(".button--shuffle");
      return shuffleButton?.classList.contains("shuffled") || false;
    },
  },
  // Doesn't seem like it's possible to check if we can skip
  canSkipPrevious: () => true,
  canSkipNext: () => true,
  events: {
    setState: (state) =>
      querySelectorEventReport<HTMLAudioElement>("audio", (el) => (state === StateMode.PLAYING ? el.play() : el.pause()), "setState"),
    skipPrevious: () => {
      const el: HTMLButtonElement | null | undefined = document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="previous"]')
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--previous");
      if (!el) return;
      if (site.info.positionSeconds() > 3) {
        setTimeout(() => el.click(), 500);
      }
      el.click();
    },
    skipNext: () =>
      document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="next"]')
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--next")
        ?.click(),
    setPositionSeconds: (positionInSeconds: number) =>
      querySelectorEventReport<HTMLAudioElement>("audio", (el) => (el.currentTime = positionInSeconds), "setPositionSeconds"),
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLAudioElement>("audio", (el) => (el.volume = volume / 100), "setVolume"),
    toggleRepeatMode: () =>
      document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-repeat")
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--repeat")
        ?.click(),
    toggleShuffleActive: () =>
      document
        .querySelector("amp-chrome-player")
        ?.shadowRoot?.querySelector("apple-music-playback-controls")
        ?.shadowRoot?.querySelector("amp-playback-controls-shuffle")
        ?.shadowRoot?.querySelector<HTMLButtonElement>(".button--shuffle")
        ?.click(),
    setRating: null,
  },
};

export default site;
