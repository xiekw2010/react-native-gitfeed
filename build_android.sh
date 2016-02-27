#!/usr/bin/env bash

cd android
./gradlew assembleRelease
adb install app/build/outputs/apk/app-release.apk
