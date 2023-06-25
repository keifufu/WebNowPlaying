import { convertTimeToSeconds } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";

// Note: currently doesn't support clips but with how they are shown I don't think it matters.
// Also volume control might not be perfect, but it should be fine seeing as it somehow defaults
// to muting the player when switching streams anyway.

const site: Site = {
  match: () => window.location.hostname === "kick.com",
  ready: () => querySelector<boolean, HTMLVideoElement>("#video-holder video", () => true, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "Kick",
    state: () =>
      querySelectorReport<StateMode, HTMLVideoElement>(
        "#video-holder video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      ),
    title: () => querySelectorReport<string, HTMLSpanElement>(".stream-title", (el) => el.innerText, "", "title"),
    artist: () => querySelectorReport<string, HTMLSpanElement>(".stream-username > span", (el) => el.innerText, "", "artist"),
    album: () => "",
    coverUrl: () => querySelectorReport<string, HTMLImageElement>("#main-view .profile-picture > img", (el) => el.src, "", "coverUrl"),
    durationSeconds: () =>
      querySelectorReport<number, HTMLVideoElement>(
        "#video-holder video",
        (el) => {
          if (el.duration !== 1073741824) return el.duration;
          return querySelectorReport<number, HTMLDivElement>(".vjs-remaining-time", (el) => convertTimeToSeconds(el.innerText), 0, "durationSeconds");
        },
        0,
        "durationSeconds"
      ),
    positionSeconds: () =>
      querySelectorReport<number, HTMLVideoElement>(
        "#video-holder video",
        (el) => {
          if (el.duration !== 1073741824) return el.currentTime;
          return querySelectorReport<number, HTMLDivElement>(".vjs-remaining-time", (el) => convertTimeToSeconds(el.innerText), 0, "positionSeconds");
        },
        0,
        "positionSeconds"
      ),
    volume: () => querySelectorReport<number, HTMLVideoElement>("#video-holder video", (el) => (el.muted ? 0 : el.volume), 0, "volume"),
    rating: () => 0,
    repeatMode: () =>
      querySelectorReport<RepeatMode, HTMLVideoElement>(
        "#video-holder video",
        (el) => (el.loop ? RepeatMode.ONE : RepeatMode.NONE),
        RepeatMode.NONE,
        "repeatMode"
      ),
    shuffleActive: () => false,
  },
  canSkipPrevious: () => false,
  canSkipNext: () => false,
  events: {
    setState: (state) =>
      querySelectorEventReport<HTMLVideoElement>("#video-holder video", (el) => (state === StateMode.PLAYING ? el.play() : el.pause()), "setState"),
    skipPrevious: null,
    skipNext: null,
    setPositionSeconds: (seconds) =>
      querySelectorEventReport<HTMLVideoElement>("#video-holder video", (el) => (el.currentTime = seconds), "setPositionSeconds"),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>(
        "#video-holder video",
        (el) => {
          el.muted = false;
          el.volume = volume / 100;
        },
        "setVolume"
      );
    },
    toggleRepeatMode: () => querySelectorEventReport<HTMLVideoElement>("#video-holder video", (el) => (el.loop = !el.loop), "toggleRepeatMode"),
    toggleShuffleActive: null,
    setRating: null,
  },
};

export default site;
