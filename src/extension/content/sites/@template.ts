import { TSupportedSites } from "../../../utils/settings";
import { RatingSystem, RepeatMode, Site, StateMode } from "../../types";

const site: Site = {
  match: () => false,
  ready: () => false,
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => "" as TSupportedSites, // The name of the player
    state: () => StateMode.STOPPED,
    title: () => "", // The title of the current song
    artist: () => "", // The artist of the current song
    album: () => "", // The album of the current song
    coverUrl: () => "", // A link to the cover image of the current song
    durationSeconds: () => 0, // The duration of the current song (mm:ss)
    positionSeconds: () => 0, // The current position of the song (mm:ss)
    volume: () => 100, // The volume of the player (1-100)
    rating: () => 0, // The rating of the current song (1-5)
    repeatMode: () => RepeatMode.NONE,
    shuffleActive: () => false,
  },
  events: {
    setState: null,
    skipPrevious: null,
    skipNext: null,
    setPositionSeconds: null,
    setPositionPercentage: null,
    setVolume: null, // Volume is 1-100
    toggleRepeatMode: null,
    toggleShuffleActive: null,
    setRating: null,
  },
};

export default site;
