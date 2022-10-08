#!/bin/bash

set -e

xcodebuild \
  -project ios/RNBackgroundExample.xcodeproj \
  -scheme 'RNBackgroundExample' \
  -configuration $1 \
  -sdk iphonesimulator \
  -derivedDataPath ios/build \
  -quiet
