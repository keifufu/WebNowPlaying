import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, positionSecondsToPercent, ratingUtils } from "../utils";

const getPlayer = () => (window as any).dzPlayer;
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const Deezer: Site = {
  init: null,
  ready: () => !!navigator.mediaSession.metadata && !!document.querySelector(".track-link"),
  info: createSiteInfo({
    name: () => "Deezer",
    title: () => getPlayer()?.getSongTitle() ?? "",
    artist: () => getPlayer()?.getArtistName() ?? "",
    album: () => getPlayer()?.getAlbumTitle() ?? "",
    cover: () => {
      const id = getPlayer()?.getCover();
      if (id) return `https://e-cdns-images.dzcdn.net/images/cover/${id}/512x512-000000-80-0-0.jpg`;
      return "";
    },
    state: () => (getPlayer()?.playing ? StateMode.PLAYING : getPlayer()?.paused ? StateMode.PAUSED : StateMode.STOPPED),
    position: () => getPlayer()?.position ?? 0,
    duration: () => getPlayer()?.duration ?? 0,
    volume: () => (getPlayer()?.muted ? 0 : getPlayer()?.volume * 100 ?? 100),
    rating: () => {
      const svg = document.querySelectorAll(".track-actions svg")[2];
      if (svg && svg.getAttribute("data-testid") === "HeartIcon") return 5;
      return 0;
    },
    repeat: () => (getPlayer()?.repeat === 2 ? Repeat.ONE : getPlayer()?.repeat === 1 ? Repeat.ALL : Repeat.NONE),
    shuffle: () => getPlayer()?.shuffle ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          getPlayerThrow().control.stop();
          break;
        case StateMode.PAUSED:
          getPlayerThrow().control.pause();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().control.play();
          break;
      }
    },
    skipPrevious: () => {
      getPlayerThrow().control.prevSong();
    },
    skipNext: () => {
      getPlayerThrow().control.nextSong();
    },
    setPosition: (seconds) => {
      const percent = positionSecondsToPercent(Deezer, seconds);
      if (!getPlayerThrow().control.canSeek()) throw new EventError();
      getPlayerThrow().control.seek(percent);
    },
    setVolume: (volume) => {
      // setVolume handles unmuting if muted
      getPlayerThrow().control.setVolume(volume / 100);
    },
    setRating: (rating) => {
      ratingUtils.like(Deezer, rating, {
        toggleLike: () => {
          const button = document.querySelectorAll<HTMLButtonElement>(".track-actions button")[2];
          if (!button) throw new EventError();
          button.click();
        },
      });
    },
    setRepeat: (repeat) => {
      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      getPlayerThrow().control.setRepeat(repeatMap[repeat]);
    },
    setShuffle: (shuffle) => {
      getPlayerThrow().control.setShuffle(shuffle);
    },
  },
  controls: () =>
    createDefaultControls(Deezer, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: !document.querySelectorAll<HTMLButtonElement>(".player-controls button")[0]?.disabled,
      canSkipNext: !document.querySelectorAll<HTMLButtonElement>(".player-controls button")[2]?.disabled,
    }),
};

export default Deezer;
