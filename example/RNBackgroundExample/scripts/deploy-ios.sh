#!/bin/bash

set -e

xcodebuild \
  -workspace ios/RNBackgroundExample.xcworkspace \
  -scheme 'RNBackgroundExample' \
  -configuration $1 \
  -sdk iphonesimulator \
  -UseModernBuildSystem=NO \
  -derivedDataPath ios/build \
  -quiet
