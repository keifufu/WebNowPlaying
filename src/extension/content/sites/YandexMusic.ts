import { convertTimeToSeconds, getMediaSessionCover } from "../../../utils/misc";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";
import { querySelector, querySelectorEvent } from "../selectors";
import { ratingUtils } from "../utils";

/*
 * Note (@keifufu)
 * This has been implemented and tested by @koteikanata.
 * Since yandex music is only available in Russia and a select few surrounding countries, and I do not have a VPN to those countries,
 * i can't verify this site's functionality or fix any bugs or update it for future site changes.
 *
 * I also replaced reporting query selectors with their non-reporting counterparts because of this.
 */

const site: Site = {
  match: () => window.location.hostname === "music.yandex.ru" || window.location.hostname === "music.yandex.com",
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>(".player-controls__btn_play", (el) => true, false),
  ratingSystem: RatingSystem.LIKE_DISLIKE,
  info: {
    playerName: () => "Yandex Music",
    state: () =>
      querySelector<StateMode, HTMLElement>(
        ".player-controls__btn_play",
        (el) => (el.classList.contains("d-icon_play") ? StateMode.PAUSED : StateMode.PLAYING),
        StateMode.PAUSED
      ),
    title: () => navigator.mediaSession.metadata?.title || "",
    artist: () => navigator.mediaSession.metadata?.artist || "",
    album: () => navigator.mediaSession.metadata?.album || "",
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => querySelector<number, HTMLElement>(".progress__bar .progress__right", (el) => convertTimeToSeconds(el.innerText), 0),
    positionSeconds: () => querySelector<number, HTMLElement>(".progress__bar .progress__left", (el) => convertTimeToSeconds(el.innerText), 0),
    volume: () => querySelector<number, HTMLElement>(".volume__icon", (el) => (el.classList.contains("volume__icon_mute") ? 0 : 100), 100),
    rating: () => querySelector<number, HTMLElement>(".player-controls__track-controls .d-icon_heart-full", (el) => (el === null ? 0 : 5), 0),
    repeatMode: () =>
      querySelector<RepeatMode, HTMLButtonElement>(
        ".player-controls__btn_repeat",
        (el) => {
          const state = el.classList;
          if (state.contains("player-controls__btn_repeat_state1")) return RepeatMode.ALL;
          if (state.contains("player-controls__btn_repeat_state2")) return RepeatMode.ONE;
          return RepeatMode.NONE;
        },
        RepeatMode.NONE
      ),
    shuffleActive: () =>
      querySelector<boolean, HTMLButtonElement>(".player-controls__btn_shuffle", (el) => el.classList.contains("player-controls__btn_on"), false),
  },
  canSkipPrevious: () => querySelector<boolean, HTMLButtonElement>(".d-icon_track-prev", (el) => !el.disabled, false),
  canSkipNext: () => querySelector<boolean, HTMLButtonElement>(".d-icon_track-next", (el) => !el.disabled, false),
  events: {
    setState: (state) =>
      querySelectorEvent<HTMLButtonElement>(".player-controls__btn_play", (el) => {
        el.click();
        if (state === StateMode.PLAYING) return StateMode.PAUSED;
        return StateMode.PLAYING;
      }),
    skipPrevious: () => querySelectorEvent<HTMLButtonElement>(".d-icon_track-prev", (el) => el.click()),
    skipNext: () => querySelectorEvent<HTMLButtonElement>(".d-icon_track-next", (el) => el.click()),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEvent<HTMLElement>(".progress__progress", (el) => {
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
      });
    },
    setVolume: (volume: number) => {
      const currVolume = site.info.volume();
      if ((currVolume === 0 && volume > 0) || (currVolume === 100 && volume < 100))
        querySelectorEvent<HTMLButtonElement>(".volume__btn", (el) => el.click());
    },
    toggleRepeatMode: () => querySelectorEvent<HTMLButtonElement>(".player-controls__btn_repeat", (el) => el.click()),
    toggleShuffleActive: () => querySelectorEvent<HTMLButtonElement>(".player-controls__btn_shuffle", (el) => el.click()),
    setRating: (rating: number) => {
      ratingUtils.likeDislike(rating, site, {
        toggleLike: () => {
          querySelectorEvent<HTMLButtonElement>(".player-controls__btn .d-icon_heart", (el) => el.click());
        },
        toggleDislike: () => {
          querySelectorEvent<HTMLButtonElement>(".player-controls__btn .d-icon_heart-full", (el) => el.click());
        },
      });
    },
  },
};

export default site;
