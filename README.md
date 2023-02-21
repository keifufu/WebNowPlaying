# WebNowPlaying Redux
A fork of the [original](https://github.com/tjhrulz/WebNowPlaying-BrowserExtension) WebNowPlaying browser extension, rebuilt from scratch to make development easier.  
Intended to work together with the [original](https://github.com/tjhrulz/WebNowPlaying) WebNowPlaying Rainmeter plugin.

### Supported websites
- Apple Music
- Bandcamp
- Deezer
- Plex
- SoundCloud
- Spotify
- Tidal
- Twitch
- YouTube
- Youtube Embeds
- YouTube Music
- Any website with a video or music element might work, you can enable them in the options (Click the extension icon)

I will consider adding other websites if there is demand for it.  
Please do keep in mind that I can't easily develop for paid services,
unless they have a fully functioning demo.  
For example, Amazon Music's demo has half it's UI elements hidden, you can't skip through songs, etc.

## Installing
Firefox: [Mozilla Addon Store](https://addons.mozilla.org/en-US/firefox/addon/webnowplaying-redux/)  
Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/webnowplaying-redux/ejimjbbegnadfnpgnnfngljgmgpddnmp)  
Edge, Opera, etc. also use the Chrome Web Store

## Building from source
- Install [Node.js](https://nodejs.org)
- Install pnpm globally with `npm i -g pnpm`
- Run `pnpm i`
- Run `pnpm run build`
- The output will be in /dist