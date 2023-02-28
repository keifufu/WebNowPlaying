# WebNowPlaying-Redux
A browser extension that provides information and controls for media playing in the browser to external adapters.  
It detects information about the media being played, such as the title, artist, album, and more.

// TODO: explain a bit more about events and adapters

## Adapters
- [WebNowPlaying-Redux-Rainmeter](https://github.com/keifufu/WebNowPlaying-Redux-Rainmeter) by [keifufu](https://github.com/keifufu), [tjhrulz](https://github.com/tjhrulz/)
- Want to create or submit your own adapter? Click [here](https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md)!

## Supported websites
- Apple Music
- Bandcamp
- Deezer
- Pandora
- Plex
- SoundCloud
- Spotify
- Tidal
- Twitch
- YouTube
- Youtube Embeds
- YouTube Music
- Any website with a video or music element might work, you can enable them in the options (Click the extension icon)

I will consider adding other websites where there is demand for.  
Please do keep in mind that I can't easily develop for paid services.

## Installing
// TODO: update webstore links below
Firefox: [Mozilla Addon Store](https://addons.mozilla.org/en-US/firefox/addon/webnowplaying-redux/)  
Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/webnowplaying-redux/ejimjbbegnadfnpgnnfngljgmgpddnmp)  
Edge, Opera, etc. also use the Chrome Web Store

## TODO
- Section skipping on Youtube
- Netflix support
- Deezer volume support
- Pandora volume support
- Tidal volume support
- volume should return 100 if it fails to get it, but it shouldn't default to it as that has now caused it to return 100 when videos are at 0 (muted)

## Building from source
- Install [Node.js](https://nodejs.org)
- Install pnpm globally with `npm i -g pnpm`
- Run `pnpm i`
- Run `pnpm run build`
- The output will be in /dist