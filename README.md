# react-native-background-upload [![npm version](https://badge.fury.io/js/react-native-background-upload.svg)](https://badge.fury.io/js/react-native-background-upload) ![GitHub Actions status](https://github.com/Vydia/react-native-background-upload/workflows/Test%20iOS%20Example%20App/badge.svg) ![GitHub Actions status](https://github.com/Vydia/react-native-background-upload/workflows/Test%20Android%20Example%20App/badge.svg) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

The only React Native http post file uploader with android and iOS background support.  If you are uploading large files like videos, use this so your users can background your app during a long upload.

NOTE: Use major version 4 with RN 47.0 and greater.  If you have RN less than 47, use 3.0.  To view all available versions:
`npm show react-native-background-upload versions`


# Installation

## 1. Install package

`npm install --save react-native-background-upload`

or

`yarn add react-native-background-upload`

Note: if you are installing on React Native < 0.47, use `react-native-background-upload@3.0.0` instead of `react-native-background-upload`

## 2. Link Native Code

### Autolinking (React Native >= 0.60)

##### iOS

`cd ./ios && pod install && cd ../`

##### Android

No further actions required.

### Automatic Native Library Linking (React Native < 0.60)

`react-native link react-native-background-upload`

### Or, Manually Link It

#### iOS

1. In the XCode's "Project navigator", right click on your project's Libraries folder ➜ `Add Files to <...>`
2. Go to `node_modules` ➜ `react-native-background-upload` ➜ `ios` ➜ select `VydiaRNFileUploader.xcodeproj`
3. In the project `Build Settings`, search for `Header Search Paths` and add `$(SRCROOT)/../node_modules/react-native-background-upload/ios` to the list (non-recursive).
4. Add `VydiaRNFileUploader.a` to `Build Phases -> Link Binary With Libraries`

#### Android
1. Add the following lines to `android/settings.gradle`:

    ```gradle
    include ':react-native-background-upload'
    project(':react-native-background-upload').projectDir = new File(settingsDir, '../node_modules/react-native-background-upload/android')
    ```
2. Add the compile and resolutionStrategy line to the dependencies in `android/app/build.gradle`:

    ```gradle
    configurations.all { resolutionStrategy.force 'com.squareup.okhttp3:okhttp:3.4.1' } // required by react-native-background-upload until React Native supports okhttp >= okhttp 3.5

    dependencies {
        compile project(':react-native-background-upload')
    }
    ```


3. Add the import and link the package in `MainApplication.java`:

    ```java
    import com.vydia.RNUploader.UploaderReactPackage;  <-- add this import

    public class MainApplication extends Application implements ReactApplication {
        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new UploaderReactPackage() // <-- add this line
            );
        }
    }
    ```

4. Ensure Android SDK versions.  Open your app's `android/app/build.gradle` file.  Ensure `compileSdkVersion` and `targetSdkVersion` are 25.  Otherwise you'll get compilation errors.

## 3. Expo

To use this library with [Expo](https://expo.io) one must first detach (eject) the project and follow [step 2](#2-link-native-code) instructions. Additionally on iOS there is a must to add a Header Search Path to other dependencies which are managed using Pods. To do so one has to add `$(SRCROOT)/../../../ios/Pods/Headers/Public` to Header Search Path in `VydiaRNFileUploader` module using XCode.

# Usage

```js
import Upload from 'react-native-background-upload'

const options = {
  url: 'https://myservice.com/path/to/post',
  path: 'file://path/to/file/on/device',
  method: 'POST',
  type: 'raw',
  maxRetries: 2, // set retry count (Android only). Default 2
  headers: {
    'content-type': 'application/octet-stream', // Customize content-type
    'my-custom-header': 's3headervalueorwhateveryouneed'
  },
  // Below are options only supported on Android
  notification: {
    enabled: true
  },
  useUtf8Charset: true
}

Upload.startUpload(options).then((uploadId) => {
  console.log('Upload started')
  Upload.addListener('progress', uploadId, (data) => {
    console.log(`Progress: ${data.progress}%`)
  })
  Upload.addListener('error', uploadId, (data) => {
    console.log(`Error: ${data.error}%`)
  })
  Upload.addListener('cancelled', uploadId, (data) => {
    console.log(`Cancelled!`)
  })
  Upload.addListener('completed', uploadId, (data) => {
    // data includes responseCode: number and responseBody: Object
    console.log('Completed!')
  })
}).catch((err) => {
  console.log('Upload error!', err)
})
```

## Multipart Uploads

Just set the `type` option to `multipart` and set the `field` option.  Example:

```
const options = {
  url: 'https://myservice.com/path/to/post',
  path: 'file://path/to/file%20on%20device.png',
  method: 'POST',
  field: 'uploaded_media',
  type: 'multipart'
}
```

Note the `field` property is required for multipart uploads.

# API

## Top Level Functions

All top-level methods are available as named exports or methods on the default export.

### startUpload(options)

The primary method you will use, this starts the upload process.

Returns a promise with the string ID of the upload.  Will reject if there is a connection problem, the file doesn't exist, or there is some other problem.

`options` is an object with following values:

*Note: You must provide valid URIs. react-native-background-upload does not escape the values you provide.*

|Name|Type|Required|Default|Description|Example|
|---|---|---|---|---|---|
|`url`|string|Required||URL to upload to|`https://myservice.com/path/to/post`|
|`path`|string|Required||File path on device|`file://something/coming/from%20the%20device.png`|
|`type`|'raw' or 'multipart'|Optional|`raw`|Primary upload type.||
|`method`|string|Optional|`POST`|HTTP method||
|`customUploadId`|string|Optional||`startUpload` returns a Promise that includes the upload ID, which can be used for future status checks.  By default, the upload ID is automatically generated.  This parameter allows a custom ID to use instead of the default.||
|`headers`|object|Optional||HTTP headers|`{ 'Accept': 'application/json' }`|
|`field`|string|Required if `type: 'multipart'`||The form field name for the file.  Only used when `type: 'multipart`|`uploaded-file`|
|`parameters`|object|Optional||Additional form fields to include in the HTTP request. Only used when `type: 'multipart`||
|`notification`|Notification object (see below)|Optional||Android only.  |`{ enabled: true, onProgressTitle: "Uploading...", autoClear: true }`|
|`useUtf8Charset`|boolean|Optional||Android only. Set to true to use `utf-8` as charset. ||
|`appGroup`|string|Optional|iOS only. App group ID needed for share extensions to be able to properly call the library. See: https://developer.apple.com/documentation/foundation/nsfilemanager/1412643-containerurlforsecurityapplicati

### Notification Object (Android Only)
|Name|Type|Required|Description|Example|
|---|---|---|---|---|
|`enabled`|boolean|Optional|Enable or diasable notifications. Works only on Android version < 8.0 Oreo. On Android versions >= 8.0 Oreo is required by Google's policy to display a notification when a background service run|`{ enabled: true }`|
|`autoClear`|boolean|Optional|Autoclear notification on complete|`{ autoclear: true }`|
|`notificationChannel`|string|Optional|Sets android notificaion channel|`{ notificationChannel: "My-Upload-Service" }`|
|`enableRingTone`|boolean|Optional|Sets whether or not to enable the notification sound when the upload gets completed with success or error|`{ enableRingTone: true }`|
|`onProgressTitle`|string|Optional|Sets notification progress title|`{ onProgressTitle: "Uploading" }`|
|`onProgressMessage`|string|Optional|Sets notification progress message|`{ onProgressMessage: "Uploading new video" }`|
|`onCompleteTitle`|string|Optional|Sets notification complete title|`{ onCompleteTitle: "Upload finished" }`|
|`onCompleteMessage`|string|Optional|Sets notification complete message|`{ onCompleteMessage: "Your video has been uploaded" }`|
|`onErrorTitle`|string|Optional|Sets notification error title|`{ onErrorTitle: "Upload error" }`|
|`onErrorMessage`|string|Optional|Sets notification error message|`{ onErrorMessage: "An error occured while uploading a video" }`|
|`onCancelledTitle`|string|Optional|Sets notification cancelled title|`{ onCancelledTitle: "Upload cancelled" }`|
|`onCancelledMessage`|string|Optional|Sets notification cancelled message|`{ onCancelledMessage: "Video upload was cancelled" }`|


### getFileInfo(path)

Returns some useful information about the file in question.  Useful if you want to set a MIME type header.

`path` is a string, such as `file://path.to.the.file.png`

Returns a Promise that resolves to an object containing:

|Name|Type|Required|Description|Example|
|---|---|---|---|---|
|`name`|string|Required|The file name within its directory.|`image2.png`|
|`exists`|boolean|Required|Is there a file matching this path?||
|`size`|number|If `exists`|File size, in bytes||
|`extension`|string|If `exists`|File extension|`mov`|
|`mimeType`|string|If `exists`|The MIME type for the file.|`video/mp4`|

### cancelUpload(uploadId)

Cancels an upload.

`uploadId` is the result of the Promise returned from `startUpload`

Returns a Promise that resolves to an boolean indicating whether the upload was cancelled.

### addListener(eventType, uploadId, listener)

Adds an event listener, possibly confined to a single upload.

`eventType` Event to listen for. Values: 'progress' | 'error' | 'completed' | 'cancelled'

`uploadId` The upload ID from `startUpload` to filter events for.  If null, this will include all uploads.

`listener` Function to call when the event occurs.

Returns an [EventSubscription](https://github.com/facebook/react-native/blob/master/Libraries/vendor/emitter/EmitterSubscription.js). To remove the listener, call `remove()` on the `EventSubscription`.

### canSuspendIfBackground()

If you are not using [iOS background events](#ios-background-events), you can ignore this method.

Notify the OS that your app can sleep again. Call this method when your app has done all its work or is waiting for background uploads to complete. Upon calling the method, you app is suspended if it's running in the background. Native code and JS will pause execution. Apple recommends you keep background execution time at less than 5 to 10 sec.

Here are a few common situations and how to handle them:

 - Uploads are finished (completed, error or cancelled) and your app does not need to do any more work. You should call `canSuspendIfBackground` after receiving the events.
 
 - Uploads are finished (completed, error or cancelled) and your app needs to run some computation or make a network request. You should call `canSuspendIfBackground` after the computation or network call is done.
 
 - Uploads are finished (completed, error or cancelled) and your app needs to upload some more. You call `startUpload` a number of times and add your listeners. You should call `canSuspendIfBackground` after the uploads start but not wait for them to finish. You also need to call `canSuspendIfBackground` after you have received the events, even if some uploads are cancelled or fail:
 
```javascript
import { addListener, startUpload, canSuspendIfBackground } from 'react-native-background-upload';

function listenForUploadCompletion(uploadId) {
  return new Promise((resolve, reject) => {
    addListener('error', uploadId, reject);
    addListener('cancelled', uploadId, () => reject(new Error('upload cancelled')));
    addListener('completed', uploadId, ({ responseCode, responseBody }) => {
      if (200 <= responseCode && responseCode <= 299) {
          resolve(uploadId);
      } else {
          reject(new Error(`Could not upload file (${responseCode}):\n${responseBody}`));
      }
    });
  });
}

async function uploadFilesWhileInBackground(url, files) {
  const uploadIds = await Promise.all(files.map(path => startUpload({ path, url })));
  const didUploadPromise = Promise.all(uploadIds.map(id => listenForUploadCompletion(id)));
  // suspend after event listeners are added
  canSuspendIfBackground();
  try {
    await didUploadPromise;
    // update the app UI
  } catch (e) {
    // handle error (show alert, present local notification, etc)
  }
  canSuspendIfBackground();
}
```


## Events

### progress

Event Data

|Name|Type|Required|Description|
|---|---|---|---|
|`id`|string|Required|The ID of the upload.|
|`progress`|0-100|Required|Percentage completed.|

### error

Event Data

|Name|Type|Required|Description|
|---|---|---|---|
|`id`|string|Required|The ID of the upload.|
|`error`|string|Required|Error message.|

### completed

Event Data

|Name|Type|Required|Description|
|---|---|---|---|
|`id`|string|Required|The ID of the upload.|
|`responseCode`|string|Required|HTTP status code received|
|`responseBody`|string|Required|HTTP response body|

### cancelled

Event Data

|Name|Type|Required|Description|
|---|---|---|---|
|`id`|string|Required|The ID of the upload.|

# iOS Background Events

By default, iOS does not wake up your app when uploads are done while your app is not in the foreground. To receive the upload events (`error`, `completed`...) while your app is in the background, add the following to your `AppDelegate.m`:

```objective-c
#import "VydiaRNFileUploader.h"

- (void)application:(UIApplication *)application
        handleEventsForBackgroundURLSession:(NSString *)identifier
        completionHandler:(void (^)(void))completionHandler {
  [VydiaRNFileUploader setBackgroundSessionCompletionHandler:completionHandler];
}
```

This means you can do extra work in the background, like make network calls or uploads more files! You _must_ call `canSuspendIfBackground` when you are done processing the events to sleep again. You can safely call this method when you are not in the background.

Here is a JS example:

```javascript
import RNBackgroundUpload from 'react-native-background-upload';

async function uploadFile(url, fileURI) {
  const uploadId = await RNBackgroundUpload.startUpload({ url, path: fileURI, method: 'POST' });
  return new Promise((resolve, reject) => {
    RNBackgroundUpload.addListener('error', uploadId, reject);
    RNBackgroundUpload.addListener('cancelled', uploadId, () => reject(new Error('upload cancelled')));
    RNBackgroundUpload.addListener('completed', uploadId, ({ responseCode, responseBody }) => {
      if (200 <= responseCode && responseCode <= 299) {
          resolve(uploadId);
      } else {
          reject(new Error(`Could not upload file (${responseCode}):\n${responseBody}`));
      }
    });
  });
}

async function uploadManyFilesThenPOST(files) {
  try {
    await Promise.all(files.map(fileURI => uploadFile('https://example.com/upload', fileURI)));
    const response = await fetch('https://example.com/confirmUploads', { method: 'POST' });
    if (!response.ok) throw new Error('Could not confirm uploads');
  } catch (error) {
    const response = await fetch('https://example.com/failedUploads', { method: 'POST' });
    if (!response.ok) throw new Error('Could not report failed uploads');
  }
  RNBackgroundUpload.canSuspendIfBackground();
}
```

The function `uploadManyFilesThenPOST` schedules all the file uploads at once. This is recommended because the OS can then make progress on all uploads even while your app sleeps. This may take some time as iOS decides to upload when it deems appropriate, e.g. when the device is charging and connected to WiFi. Inversely, when the device is low on battery or in energy saver mode, background uploads won't make progress.

When all uploads are finished, your app _may_ be resumed in the background to receive the events. You should call `canSuspendIfBackground` as soon as possible when you are done with other actions to conserve your app "background credit". If you don't call `canSuspendIfBackground`, the library will call it for your after ~45 seconds. This makes sure that your app won't be killed by the OS right away but pretty much consumes all your background credit.

Uploads tasks started when the app is in the background are [discretionary](https://developer.apple.com/documentation/foundation/nsurlsessionconfiguration/1411552-discretionary?language=objc); iOS will typically upload the files later when the device is charging. Upload tasks started in the foreground are not [discretionary](https://developer.apple.com/documentation/foundation/nsurlsessionconfiguration/1411552-discretionary?language=objc) and start right away. When your app is brought to the foreground, uploads that have been postponed by the OS will continue regardless of background credit.

If your app is dead when uploads complete (force-closed by the user via the app switcher or by the OS to reclaim memory), iOS will launch it in the background. The above example does not handle this case, i.e. there will be no `POST` to `https://example.com/confirmUploads`. To support this you should save the `uploadId`(s) to a file (e.g. via `AsyncStorage`), read it when your app starts, and add the 3 listeners back.

# Customizing Android Build Properties
You may want to customize the `compileSdk, buildToolsVersion, and targetSdkVersion` versions used by this package.  For that, add this to `android/build.gradle`:

```
ext {
    targetSdkVersion = 23
    compileSdkVersion = 23
    buildToolsVersion = '23.0.2'
}
```

Add it above `allProjects` and you're good.  Your `android/build.gradle` might then resemble:
```
buildscript {
    repositories {
        jcenter()
    }
}

ext {
    targetSdkVersion = 27
    compileSdkVersion = 27
    buildToolsVersion = '23.0.2'
}

allprojects {

```

# FAQs

Is there an example/sandbox app to test out this package?

> Yes, there is a simple react native app that comes with an [express](https://github.com/expressjs/express) server where you can see react-native-background-upload in action and try things out in an isolated local environment.

[RNBackgroundExample](https://github.com/Vydia/react-native-background-upload/blob/master/example/RNBackgroundExample)

Does it support iOS camera roll assets?

> Yes, as of version 4.3.0.

I'm not receiving events while the app is in background!

> There are no background events on Android. For iOS, add the following in your `AppDelegate.m`:

```objective-c
#import "VydiaRNFileUploader.h"

- (void)application:(UIApplication *)application
        handleEventsForBackgroundURLSession:(NSString *)identifier
        completionHandler:(void (^)(void))completionHandler {
  [VydiaRNFileUploader setBackgroundSessionCompletionHandler:completionHandler];
}
```

Does it support multiple file uploads?

> Yes and No.  It supports multiple concurrent uploads, but only a single file upload per request.

Why should I use this file uploader instead of others that I've Googled like [react-native-uploader](https://github.com/aroth/react-native-uploader)?

> This package has two killer features not found anywhere else (as of 12/16/2016).  First, it works on both iOS and Android.  Others are iOS only.  Second, it supports background uploading.  This means that users can background your app and the upload will continue.  This does not happen with other uploaders.


# Contributing

See [CONTRIBUTING.md](https://github.com/Vydia/react-native-background-upload/CONTRIBUTING.md).

# Common Issues

## BREAKING CHANGE IN 3.0
This is for 3.0 only.  This does NOT apply to 4.0, as recent React Native versions have upgraded the `okhttp` dependencies.  Anyway...

In 3.0, you need to add
```gradle
    configurations.all { resolutionStrategy.force 'com.squareup.okhttp3:okhttp:3.4.1' }
```
to your app's app's `android/app/build.gradle` file.

Just add it above (not within) `dependencies` and you'll be fine.


## BREAKING CHANGE IN 2.0
Two big things happened in version 2.0.  First, thehe Android package name had to be changed, as it conflicted with our own internal app.  My bad.  Second, we updated the android upload service dependency to the latest, but that requires the app have a compileSdkVersion and targetSdkVersion or 25.

To upgrade:
In `MainApplication.java`:

Change

    ```java
    import com.vydia.UploaderReactPackage;
    ```

to

    ```java
    import com.vydia.RNUploader.UploaderReactPackage;
    ```

Then open your app's `android/app/build.gradle` file.
Ensure `compileSdkVersion` and `targetSdkVersion` are 25.

Done!


## Gratitude

Thanks to:
- [android-upload-service](https://github.com/gotev/android-upload-service)  It made Android dead simple to support.

- [MIME type from path on iOS](http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database)  Thanks for the answer!
