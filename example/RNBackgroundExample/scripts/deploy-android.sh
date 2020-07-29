#!/bin/bash

set -e

cd android

lower=$(echo $1 | tr "[:upper:]" "[:lower:]")

./gradlew \
  assemble$1\
  assembleAndroidTest\
  -DtestBuildType=$lower

cd -
