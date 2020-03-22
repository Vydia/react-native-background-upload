# Example App for [react-native-background-upload](https://github.com/Vydia/react-native-background-upload)

This is a React Native app and Express server that servers ars a very basic
implementation of react-native-background-upload. Use this repo to experiment
with the package, or fork this repo and use it to create a minimal reproduction
of a bug or other issue when opening up a github issue on
[react-native-background-upload](https://github.com/Vydia/react-native-background-upload).

## Usage

 1. Clone the repo
 1. `yarn install`
 1. `yarn server`
 1. Run the example app `react-native run-ios` or `react-native run-android`
 1. Tap the button in the mobile app to perform an upload.

If you are running on an Android enumlator/device and uploads don't 'just work', run `adb reverse tcp:8080 tcp:8080` after `react-native run-android`.  This will allow the device to communicate with the server.  Otherwise it won't work.

## E2E Tests

You need to have [Detox setup](https://github.com/wix/Detox/blob/master/docs/Introduction.GettingStarted.md).

To run the E2E Tests for Android, do the following:

 1. Clone the repo
 1. `yarn`
 1. `yarn e2e/deploy/android`
 1. `yarn e2e/test/android`

To run the E2E Tests for iOS, do the following:

 1. Clone the repo
 1. `yarn`
 1. `yarn deploy/release/ios`
 1. `yarn e2e/test/ios`

## Important files to look at

### [App.js](https://github.com/Vydia/react-native-background-upload/blob/master/example/RNBackgroundExample/App.js)

The React Native component that allows the user to choose an image from device
and upload it to the localhost server.

*Note: In the iOS simulator, you can add images and videos to the camera roll by
dragging and dropping files from finder onto the simulator window. In the Android
emulator you can usually use the emulator camera app to take test picture.*

### [e2e/start-server.js](https://github.com/Vydia/react-native-background-upload/blob/master/example/RNBackgroundExample/e2e/start-server.js)

The express server that receives the upload and writes it to file.
