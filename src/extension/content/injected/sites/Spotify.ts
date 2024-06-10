import { getMediaSessionCover } from "../../../../utils/misc";
import { EventError, RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, ratingUtils } from "../utils";

let _Spotify: any = null;
function getSpotify() {
  if (_Spotify !== null) return _Spotify;
  const Spotify = {};
  (window as any).registry._map.forEach((value: any, key: any) => {
    (Spotify as any)[key.description] = value.instance;
  });
  _Spotify = Spotify;
  return Spotify;
}

function getSpotifyThrow() {
  const Spotify = getSpotify();
  if (!Spotify || Object.keys(Spotify).length == 0) return Spotify;
  throw new EventError();
}

const Spotify: Site = {
  init: null,
  ready: () => !!getSpotify().PlayerAPI._state,
  info: createSiteInfo({
    name: () => "Spotify",
    title: () => navigator.mediaSession.metadata?.title ?? "",
    artist: () => navigator.mediaSession.metadata?.artist ?? "",
    album: () => navigator.mediaSession.metadata?.album ?? "",
    cover: () => getMediaSessionCover(),
    state: () => (getSpotify().PlayerAPI._state.isPaused === false ? StateMode.PLAYING : StateMode.PAUSED), // technically never STOPPED, unless not ready()
    position: () => {
      const PlayerAPI = getSpotify().PlayerAPI;
      if (PlayerAPI._state.isPaused) {
        return Math.floor(PlayerAPI._state.positionAsOfTimestamp / 1000);
      } else {
        return Math.floor((Date.now() - PlayerAPI._state.timestamp + PlayerAPI._state.positionAsOfTimestamp) / 1000);
      }
    },
    duration: () => getSpotify().PlayerAPI._state.duration ?? 0,
    volume: () => getSpotify().PlaybackAPI._volume ?? 0,
    rating: () => (getSpotify().PlayerAPI._state.item.metadata["collection.in_collection"] === "true" ? 5 : 0),
    repeat: () => {
      switch (getSpotify().PlayerAPI._state.repeat) {
        default:
          return Repeat.NONE;
        case 0:
          return Repeat.NONE;
        case 1:
          return Repeat.ALL;
        case 2:
          return Repeat.ONE;
      }
    },
    shuffle: () => getSpotify().PlayerAPI._state.shuffle,
  }),
  events: {
    setState: (state) => {
      const PlayerAPI = getSpotifyThrow().PlayerAPI;
      switch (state) {
        case StateMode.STOPPED:
        case StateMode.PAUSED:
          PlayerAPI.pause();
          break;
        case StateMode.PLAYING:
          PlayerAPI.resume();
          break;
      }
    },
    skipPrevious: () => getSpotifyThrow().PlayerAPI.skipToPrevious(),
    skipNext: () => getSpotifyThrow().PlayerAPI.skipToNext(),
    setPosition: (seconds) => getSpotifyThrow().PlayerAPI.seekTo(seconds * 1000),
    setVolume: (volume) => getSpotifyThrow().PlaybackAPI.setVolume(volume),
    setRating: (rating) => {
      ratingUtils.like(Spotify, rating, {
        toggleLike: () => {
          const S = getSpotifyThrow();
          const uris = [S.PlayerAPI._state.item.uri];
          if (Spotify.info.rating() === 5) S.LibraryAPI.add({ uris });
          else S.LibraryAPI.remove({ uris });
        },
      });
    },
    setRepeat: (repeat) => {
      const PlayerAPI = getSpotifyThrow().PlayerAPI;
      switch (repeat) {
        case Repeat.NONE:
          PlayerAPI.setRepeat(0);
          break;
        case Repeat.ONE:
          PlayerAPI.setRepeat(2);
          break;
        case Repeat.ALL:
          PlayerAPI.setRepeat(1);
          break;
      }
    },
    setShuffle: (shuffle) => getSpotifyThrow().PlayerAPI.setShuffle(shuffle),
  },
  controls: () =>
    createDefaultControls(Spotify, {
      ratingSystem: RatingSystem.LIKE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

export default Spotify;
