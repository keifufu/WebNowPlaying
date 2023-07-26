# WebNowPlaying-Redux

A browser extension that provides information and controls for media playing in the browser to external adapters.

## Documentation

Full and up-to-date documentation is available on:  
https://wnp.keifufu.dev

## Installing

Firefox: [Mozilla Addon Store](https://addons.mozilla.org/en-US/firefox/addon/webnowplaying-redux)  
Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/webnowplaying-redux/jfakgfcdgpghbbefmdfjkbdlibjgnbli)  
Edge, Opera, etc. also use the Chrome Web Store

**Note:** Due to a bug in firefox, you will have to manually grant it permissions.  
Right click "WebNowPlaying Redux" -> Manage Extension -> Permissions -> Check "Access your data for all websites"

## Adapters

- [WebNowPlaying-Redux-Rainmeter](https://github.com/keifufu/WebNowPlaying-Redux-Rainmeter) by [keifufu](https://github.com/keifufu), [tjhrulz](https://github.com/tjhrulz/)
- [WebNowPlaying-Redux-Macro-Deck](https://github.com/jbcarreon123/WebNowPlaying-Redux-Macro-Deck) by [jbcarreon123](https://github.com/jbcarreon123)
- [WebNowPlaying-Redux-OBS](https://github.com/keifufu/WebNowPlaying-Redux-OBS) by [keifufu](https://github.com/keifufu)
- Want to create or submit your own adapter? Click [here](https://github.com/keifufu/WebNowPlaying-Redux/blob/main/CreatingAdapters.md)!

## Building from source

- Install [Node.js](https://nodejs.org)
- Install pnpm globally with `npm i -g pnpm`
- Run `pnpm install`
- Run `pnpm run build`
- The output will be in /dist
