import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";

const site: Site = {
  match: () => document.querySelector('link[title="Invidious"]') !== null,
  ready: () => querySelector<boolean, HTMLVideoElement>("video", () => true, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "Invidious",
    state: () =>
      querySelectorReport<StateMode, HTMLVideoElement>(
        "video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.STOPPED,
        "state"
      ),
    // a[rel="noopener"] is for embeds (/embed/)
    title: () => querySelectorReport<string, HTMLElement>('#contents > div > h1, a[rel="noopener"]', (el) => el.innerText, "", "title"),
    artist: () => querySelectorReport<string, HTMLElement>("#channel-name", (el) => el.innerText, "", "artist"),
    album: () => querySelector<string, HTMLAnchorElement>("#playlist a", (el) => el.innerText, ""),
    coverUrl: () => querySelectorReport<string, HTMLVideoElement>("video", (el) => el.poster, "", "coverUrl"),
    durationSeconds: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => el.duration, 0, "durationSeconds"),
    positionSeconds: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => el.currentTime, 0, "positionSeconds"),
    volume: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => (el.muted ? 0 : el.volume * 100), 100, "volume"),
    rating: () => 0,
    repeatMode: () =>
      querySelectorReport<RepeatMode, HTMLVideoElement>("video", (el) => (el.loop ? RepeatMode.ONE : RepeatMode.NONE), RepeatMode.NONE, "repeatMode"),
    shuffleActive: () => false,
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLVideoElement>("video", (el) => (el.paused ? el.play() : el.pause()), "setState");
    },
    skipPrevious: () => {
      // go back in history if the previous url is from the same domain
      if (document.referrer.includes(window.location.host)) window.history.back();
    },
    skipNext: () => querySelectorEventReport<HTMLButtonElement>(".thumbnail", (el) => el.click(), "skipNext"),
    setPositionSeconds: (seconds) => querySelectorEventReport<HTMLVideoElement>("video", (el) => (el.currentTime = seconds), "setPositionSeconds"),
    setPositionPercentage: null,
    setVolume: (volume) =>
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          el.muted = false;
          el.volume = volume / 100;
        },
        "setVolume"
      ),
    toggleRepeatMode: () => querySelectorEventReport<HTMLVideoElement>("video", (el) => (el.loop = !el.loop), "toggleRepeatMode"),
    toggleShuffleActive: null,
    setRating: null,
  },
};

export default site;
