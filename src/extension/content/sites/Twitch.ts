import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from "../selectors";

const site: Site = {
  match: () => window.location.hostname === "www.twitch.tv",
  ready: () =>
    querySelector<boolean, HTMLElement>(".video-player__default-player", () => true, false) &&
    querySelector<boolean, HTMLVideoElement>("video", () => true, false) &&
    querySelector<boolean, HTMLElement>('h2[data-a-target="stream-title"]', (el) => el.innerText.length > 0, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "Twitch",
    state: () =>
      querySelectorReport<StateMode, HTMLVideoElement>(
        "video",
        (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      ),
    title: () => querySelectorReport<string, HTMLElement>('h2[data-a-target="stream-title"]', (el) => el.innerText, "", "title"),
    artist: () => querySelectorReport<string, HTMLElement>("h1.tw-title", (el) => el.innerText, "", "artist"),
    // Seems there are scenarios where there is no 'album', so we don't report it
    album: () =>
      querySelector<string, HTMLElement>(
        'a[data-a-target="stream-game-link"] > span, [data-a-target="video-info-game-boxart-link"] p',
        (el) => el.innerText,
        ""
      ),
    coverUrl: () =>
      querySelectorReport<string, HTMLImageElement>(`img[alt="${site.info.artist()}" i]`, (el) => el.src.replace("70x70", "600x600"), "", "coverUrl"),
    durationSeconds: () => {
      if (querySelector<boolean, HTMLVideoElement>("video", (el) => el.duration === 1073741824, false)) {
        return querySelectorReport<number, HTMLElement>(
          "span.live-time",
          (el) => {
            const duration_read = el.innerText.split(":");
            duration_read.reverse();
            let duration = 0;
            for (let i = duration_read.length - 1; i >= 0; i--) duration += Number(duration_read[i]) * 60 ** i;
            return duration;
          },
          0,
          "durationSeconds"
        );
      }
      return querySelectorReport<number, HTMLVideoElement>("video", (el) => el.duration, 0, "durationSeconds");
    },
    positionSeconds: () => {
      if (querySelector<boolean, HTMLVideoElement>("video", (el) => el.duration === 1073741824, false)) {
        return querySelectorReport<number, HTMLElement>(
          "span.live-time",
          (el) => {
            const duration_read = el.innerText.split(":");
            duration_read.reverse();
            let duration = 0;
            for (let i = duration_read.length - 1; i >= 0; i--) duration += Number(duration_read[i]) * 60 ** i;
            return duration;
          },
          0,
          "positionSeconds"
        );
      }
      return querySelectorReport<number, HTMLVideoElement>("video", (el) => el.currentTime, 0, "positionSeconds");
    },
    volume: () => querySelectorReport<number, HTMLVideoElement>("video", (el) => (el.muted ? 0 : el.volume * 100), 0, "volume"),
    // Rating could be following, but ffz and/or bttv fuck it up so I can't get it consistently
    rating: () => 0,
    repeatMode: () => RepeatMode.NONE,
    shuffleActive: () => false,
  },
  canSkipPrevious: () => querySelector<boolean, HTMLVideoElement>("video", () => false, false),
  canSkipNext: () => querySelector<boolean, HTMLVideoElement>("video", () => true, false),
  events: {
    setState: (state) =>
      querySelectorEventReport<HTMLVideoElement>("video", (el) => (state === StateMode.PLAYING ? el.play() : el.pause()), "setState"),
    skipPrevious: () => {
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          if (el.duration !== 1073741824) return;
          el.currentTime = 0;
        },
        "skipPrevious"
      );
    },
    skipNext: () => {
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          if (el.duration !== 1073741824) return;
          el.currentTime = el.duration;
        },
        "skipNext"
      );
    },
    setPositionSeconds: (positionInSeconds: number) => {
      querySelectorEventReport<HTMLVideoElement>(
        "video",
        (el) => {
          if (el.duration !== 1073741824) return;
          el.currentTime = positionInSeconds;
        },
        "setPositionSeconds"
      );
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEvent<HTMLElement>('[id^="player-volume-slider"]', (el) => {
        const slider = el as HTMLInputElement;
        slider.value = (volume / 100).toString();
        slider.dispatchEvent(new Event("input", { bubbles: true }));
      });
    },
    toggleRepeatMode: null,
    toggleShuffleActive: null,
    setRating: null,
  },
};

export default site;
