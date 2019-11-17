#!/bin/bash

set -e

npx jetify

cd ios/

pod install

cd -
