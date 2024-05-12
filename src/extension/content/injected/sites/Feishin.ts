import { convertTimeToSeconds } from "../../../../utils/misc";
import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo, setRepeat, setStatePlayPauseButton } from "../utils";

/* Feishin Remote Server
Feishin classes have confusing names
Cover Art: remove width and quality modifier on url. Cover is blurry with it
OBS Widget Cover Art not working due to http security protocol. Might work if jellyfin is in https mode.
Feishin doesnt pass audio progress, or rating through remote server.
*/

const Feishin: Site = {
  init: null,
	ready: () => !!document.querySelector(".mantine-1lwh8rj"),
  info: createSiteInfo({
    name: () => "Feishin",
    title: () => document.querySelector<HTMLElement>(".mantine-1lwh8rj")?.innerText ?? "",
	artist: () => {
		let txt = document.querySelectorAll<HTMLElement>('.mantine-1kj5s9f')[1]?.innerText ?? ""
		txt = txt?.replace("Artist: ", "");
		return txt ?? "";
	},
    album: () => document.querySelector<HTMLElement>(".mantine-1kj5s9f")?.innerText ?? "",
    cover: () => {
		let txt = document.querySelectorAll<HTMLElement>(".mantine-f62fhe")[1]?.getAttribute('src');
		if (!txt) return "";
		txt = txt.replace("?width=100&quality=96", "");
		return txt ?? "";
	},
    state: () => {
		if (document.querySelectorAll<HTMLButtonElement>("button")[4]){
			if (document.querySelector('span')?.getAttribute("d") == "M19.376 12.4158L8.77735 19.4816C8.54759 19.6348 8.23715 19.5727 8.08397 19.3429C8.02922 19.2608 8 19.1643 8 19.0656V4.93408C8 4.65794 8.22386 4.43408 8.5 4.43408C8.59871 4.43408 8.69522 4.4633 8.77735 4.51806L19.376 11.5838C19.6057 11.737 19.6678 12.0474 19.5146 12.2772C19.478 12.3321 19.4309 12.3792 19.376 12.4158Z") {
				return StateMode.PAUSED;
			}
			return StateMode.PLAYING;
		}
      return StateMode.STOPPED;
      
    },
    position: () => 0,
	duration: () => {
		let txt = document.querySelector<HTMLElement>("h3.mantine-1rmtrb2")?.innerText;
		txt = txt?.replace("Duration: ", "");
		return convertTimeToSeconds(txt ?? "0");
	},
    volume: () => Number(document.querySelector("div.mantine-gw1ejc")?.nodeValue ?? "0"),
    rating: () => 0,
    repeat: () => {
      const el = document.querySelectorAll<HTMLButtonElement>("button")[7];
      if (el?.className.includes("fXSVsD")) {
        if (document.querySelector("div.fXSVsD > span")?.getAttribute("d") == "M8 19.9999V21.9323C8 22.2085 7.77614 22.4323 7.5 22.4323C7.38303 22.4323 7.26977 22.3913 7.17991 22.3165L3.06093 18.884C2.84879 18.7072 2.82013 18.3919 2.99691 18.1798C3.09191 18.0658 3.23264 17.9999 3.38103 17.9999L18 17.9999C19.1046 17.9999 20 17.1044 20 15.9999V7.99987H22V15.9999C22 18.209 20.2091 19.9999 18 19.9999H8ZM16 2.06738C16 1.79124 16.2239 1.56738 16.5 1.56738C16.617 1.56738 16.7302 1.60839 16.8201 1.68327L20.9391 5.11575C21.1512 5.29253 21.1799 5.60782 21.0031 5.81995C20.9081 5.93395 20.7674 5.99986 20.619 5.99986L6 5.99987C4.89543 5.99987 4 6.89531 4 7.99987V15.9999H2V7.99987C2 5.79074 3.79086 3.99987 6 3.99987H16V2.06738ZM11 7.99987H13V15.9999H11V9.99987H9V8.99987L11 7.99987Z") return Repeat.ONE;
        else return Repeat.ALL;
      }
      return Repeat.NONE;
    },
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      const button = document.querySelectorAll<HTMLButtonElement>("button")[4];
      if (!button) throw new Event("Failed to find button");
      const currentState = Feishin.info.state();
      setStatePlayPauseButton(button, currentState, state);
    },
    skipPrevious: () => {
      const button = document.querySelectorAll<HTMLButtonElement>("button")[3];
      if (!button) throw new EventError();
      button.click();
    },
    skipNext: () => {
      const button = document.querySelectorAll<HTMLButtonElement>("button")[5];
      if (!button) throw new EventError();
      button.click();
    },
    setPosition: (seconds) => null,
    setVolume: (volume) => null,
    setRating: (rating) => null,
    setRepeat: (repeat) => {
      const currentRepeat = Feishin.info.repeat();
      if (currentRepeat === repeat) return;

      const button = document.querySelectorAll<HTMLButtonElement>("button")[7];
      if (!button) throw new EventError();

      const repeatMap = {
        [Repeat.NONE]: 0,
        [Repeat.ALL]: 1,
        [Repeat.ONE]: 2,
      };

      setRepeat(button, repeatMap, currentRepeat, repeat);
    },
    setShuffle: (shuffle) => {
      if (Feishin.info.shuffle() === shuffle) return;
      const button = document.querySelectorAll<HTMLButtonElement>("button")[6];
      if (!button) throw new EventError();
      button.click();
    },
  },
	controls: () =>
		createDefaultControls(Feishin, {
			availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    	}),
};

export default Feishin;

// function clickButton(button: HTMLButtonElement) {
//   button.dispatchEvent(
//     new MouseEvent("mousedown", {
//       view: window,
//       bubbles: true,
//       cancelable: true,
//       clientX: 0,
//       clientY: 0,
//     }),
//   );
//   button.dispatchEvent(
//     new MouseEvent("mouseup", {
//       view: window,
//       bubbles: true,
//       cancelable: true,
//       clientX: 0,
//       clientY: 0,
//     }),
//   );
// }
