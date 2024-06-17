import { RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const Template: Site = {
  debug: {},
  init: null,
  // This exists for performance reasons. We don't query any other info if ready is false.
  ready: () => false,
  info: createSiteInfo({
    name: () => "" as any,
    title: () => "",
    artist: () => "",
    album: () => "",
    cover: () => "",
    state: () => StateMode.STOPPED,
    position: () => 0,
    duration: () => 0,
    volume: () => 100,
    rating: () => 0,
    repeat: () => Repeat.NONE,
    shuffle: () => false,
  }),
  events: {
    setState: null,
    skipPrevious: null,
    skipNext: null,
    setPosition: null,
    setVolume: null,
    setRating: null,
    setRepeat: null,
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Template, {
      ratingSystem: RatingSystem.NONE,
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      canSkipPrevious: true,
      canSkipNext: true,
    }),
};

export default Template;
