#!/usr/bin/env bash

RETURN_PATH=$(pwd)
SCRIPT_PATH=$(dirname "$(readlink -f "$0")")
cd $SCRIPT_PATH

rm WebNowPlaying.zip &> /dev/null
zip -r WebNowPlaying.zip * -x "dist/*" "node_modules/*" > /dev/null
cd $SCRIPT_PATH/dist/chrome
zip -r chrome.zip * > /dev/null
cd $SCRIPT_PATH/dist/firefox
zip -r firefox.zip * > /dev/null

cd $RETURN_PATH
