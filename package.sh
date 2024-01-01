#!/usr/bin/env bash

RETURN_PATH=$(pwd)
SCRIPT_PATH=$(dirname "$(readlink -f "$0")")
cd $SCRIPT_PATH

rm WebNowPlaying.zip &> /dev/null
zip -r ./dist/chrome/chrome.zip ./dist/chrome/* > /dev/null
zip -r ./dist/firefox/firefox.zip ./dist/firefox/* > /dev/null
zip -r WebNowPlaying.zip * -x "dist/*" "node_modules/*" > /dev/null

cd $RETURN_PATH
