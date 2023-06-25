import { getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEventReport, querySelectorReport } from "../selectors";
import { ratingUtils } from "../utils";

// Note: this site is missing proper volume support, we can only toggle mute on and off for now.
const site: Site = {
  match: () => window.location.hostname === "www.radio-addict.com",
  ready: () => navigator.mediaSession.metadata !== null,
  ratingSystem: RatingSystem.LIKE,
  info: {
    playerName: () => "Radio Addict",
    state: () =>
      querySelectorReport<StateMode, HTMLButtonElement>(
        ".player-playpause i",
        (el) => (el.classList.contains("bi-pause-circle") ? StateMode.PLAYING : StateMode.PAUSED),
        StateMode.PAUSED,
        "state"
      ),
    // Not reporting as it doesn't always have a second list element
    title: () => querySelector<string, HTMLElement>(".player-infos li:nth-child(2)", (el) => el.innerText.split("-")[1], ""),
    artist: () => querySelector<string, HTMLElement>(".player-infos li:nth-child(2)", (el) => el.innerText.split("-")[0], ""),
    album: () => "",
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => getElapsedTime(),
    positionSeconds: () => getElapsedTime(),
    volume: () => querySelector<number, HTMLElement>(".player-muted", (el) => 0, 100),
    rating: () =>
      querySelectorReport<number, HTMLElement>(".player-favorite", (el) => (el.classList.contains("player-favorite-added") ? 5 : 0), 0, "rating"),
    repeatMode: () => RepeatMode.NONE,
    shuffleActive: () => false,
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return;
      querySelectorEventReport<HTMLButtonElement>(".player-playpause", (el) => el.click(), "setState");
    },
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>(".player-radio-previous", (el) => el.click(), "skipPrevious"),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>(".player-radio-previous", (el) => el.click(), "skipNext"),
    setPositionSeconds: null,
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const currVolume = site.info.volume();
      if ((currVolume === 0 && volume > 0) || (currVolume === 100 && volume < 100))
        querySelectorEventReport<HTMLButtonElement>(".player-sound", (el) => el.click(), "setVolume");
    },
    toggleRepeatMode: null,
    toggleShuffleActive: null,
    setRating: (rating: number) => {
      ratingUtils.like(rating, site, {
        toggleLike: () => {
          querySelectorEventReport<HTMLButtonElement>(".player-favorite", (el) => el.click(), "setRating");
        },
      });
    },
  },
};

let elapsedSeconds = 0;
let lastTime = Date.now() / 1000;
function getElapsedTime() {
  if (site.info.state() !== StateMode.PLAYING) {
    lastTime = Date.now() / 1000;
    return elapsedSeconds;
  }

  const timeNow = Date.now() / 1000;
  const delta = Math.floor(timeNow - lastTime);
  if (delta > 0) {
    elapsedSeconds += delta;
    lastTime = timeNow;
  }

  return elapsedSeconds;
}

export default site;
