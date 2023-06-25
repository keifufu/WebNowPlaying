import { capitalize, convertTimeToSeconds } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from "../selectors";
import { ratingUtils } from "../utils";

const site: Site = {
  match: () => window.location.hostname === "www.pandora.com",
  ready: () =>
    querySelector<boolean, HTMLElement>(".Tuner__Audio__TrackDetail__title", (el) => el.innerText.length > 0, false) &&
    querySelector<boolean, HTMLElement>("(.VolumeDurationControl__Duration span)[2]", (el) => el.innerText.length > 0, false),
  ratingSystem: RatingSystem.LIKE_DISLIKE,
  info: {
    playerName: () => "Pandora",
    state: () => {
      // If pandora asked if you are still listening it is paused
      if (querySelector<boolean, HTMLElement>(".StillListeningBody", (el) => true, false)) return StateMode.STOPPED;
      return querySelectorReport<StateMode, HTMLElement>(
        ".PlayButton__Icon path",
        (el) => (el.getAttribute("d")?.includes("22.5v-21l16.5") ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED,
        "state"
      );
    },
    title: () => querySelectorReport<string, HTMLElement>(".Tuner__Audio__TrackDetail__title", (el) => el.innerText, "", "title"),
    artist: () => querySelectorReport<string, HTMLElement>(".Tuner__Audio__TrackDetail__artist", (el) => el.innerText, "", "artist"),
    album: () => {
      const albumName = querySelector<string, HTMLElement>(".nowPlayingTopInfo__current__albumName", (el) => el.innerText, "");
      if (albumName) return albumName;
      const albumURL = querySelector<string, HTMLAnchorElement>(
        ".Tuner__Audio__TrackDetail__title",
        (el) => el.href.replace("://www.pandora.com/artist/", ""),
        ""
      );
      if (albumURL) return capitalize(albumURL.split("/")[1].replaceAll("-", " "));
      return "";
    },
    coverUrl: () => {
      const cover = querySelector<string, HTMLImageElement>(".nowPlayingTopInfo__artContainer__art img", (el) => el.src, "");
      if (cover) return cover;
      return querySelectorReport<string, HTMLImageElement>(
        ".ImageLoader img, .nowPlayingTopInfo__artContainer img",
        (el) => `${el.src.split("/").slice(0, -1).join("/")}/500W_500H.jpg`,
        "",
        "coverUrl"
      );
    },
    durationSeconds: () =>
      querySelectorReport<number, HTMLElement>(
        "(.VolumeDurationControl__Duration span)[2]",
        (el) => convertTimeToSeconds(el.innerText),
        0,
        "durationSeconds"
      ),
    positionSeconds: () =>
      querySelectorReport<number, HTMLElement>(
        ".VolumeDurationControl__Duration span",
        (el) => convertTimeToSeconds(el.innerText),
        0,
        "positionSeconds"
      ),
    volume: () => 100,
    rating: () => {
      const thumbsUp = querySelectorReport<boolean, HTMLButtonElement>(
        ".ThumbUpButton",
        (el) => el.getAttribute("aria-checked") === "true",
        false,
        "rating"
      );
      if (thumbsUp) return 5;
      const thumbsDown = querySelectorReport<boolean, HTMLButtonElement>(
        ".ThumbDownButton",
        (el) => el.getAttribute("aria-checked") === "true",
        false,
        "rating"
      );
      if (thumbsDown) return 1;
      return 0;
    },
    // Not reporting because some views on Pandora don't have a repeat button
    repeatMode: () =>
      querySelector<RepeatMode, HTMLButtonElement>(
        ".RepeatButton",
        (el) => {
          const state = el.getAttribute("aria-checked");
          if (state === "true") return RepeatMode.ALL;
          if (state === "mixed") return RepeatMode.ONE;
          return RepeatMode.NONE;
        },
        RepeatMode.NONE
      ),
    // Not reporting because some views on Pandora don't have a shuffle button
    shuffleActive: () => querySelector<boolean, HTMLButtonElement>(".ShuffleButton", (el) => el.getAttribute("aria-checked") === "true", false),
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>(".PlayButton", (el) => el.click(), "setState");
    },
    skipPrevious: () =>
      querySelectorEventReport<HTMLButtonElement>(".ReplayButton, .Tuner__Control__SkipBack__Button", (el) => el.click(), "skipPrevious"),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>(".SkipButton, .Tuner__Control__SkipForward__Button", (el) => el.click(), "skipNext"),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>(
        ".TunerProgress__HitBox",
        (el) => {
          const loc = el.getBoundingClientRect();
          const position = positionPercentage * loc.width;

          el.dispatchEvent(
            new MouseEvent("mousedown", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
          el.dispatchEvent(
            new MouseEvent("mouseup", {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: loc.left + position,
              clientY: loc.top + loc.height / 2,
            })
          );
        },
        "setPositionPercentage"
      );
    },
    setVolume: null,
    toggleRepeatMode: () => querySelectorEvent<HTMLButtonElement>(".RepeatButton", (el) => el.click()),
    toggleShuffleActive: () => querySelectorEvent<HTMLButtonElement>(".ShuffleButton", (el) => el.click()),
    setRating: (rating: number) => {
      ratingUtils.likeDislike(rating, site, {
        toggleLike: () => {
          querySelectorEvent<HTMLButtonElement>(".ThumbUpButton", (el) => el.click());
        },
        toggleDislike: () => {
          querySelectorEvent<HTMLButtonElement>(".ThumbDownButton", (el) => el.click());
        },
      });
    },
  },
};

export default site;
