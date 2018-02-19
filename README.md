# react-native-background-upload [![npm version](https://badge.fury.io/js/react-native-background-upload.svg)](https://badge.fury.io/js/react-native-background-upload)
The only React Native http post file uploader with android and iOS background support.  If you are uploading large files like videos, use this so your users can background your app during a long upload.

NOTE: Use major version 4 with RN 47.0 and greater.  If you have RN less than 47, use 3.0.  To view all available versions:
`npm show react-native-background-upload versions`

## Installation for React Native >= 0.47

`npm install --save react-native-background-upload`

or

`yarn add react-native-background-upload`

## Installation for React Native < 0.47

`npm install --save react-native-background-upload@3.0.0`

### Automatic Native Library Linking

`react-native link react-native-background-upload`

### Manual Native Library Linking

#### iOS

1. In the XCode's "Project navigator", right click on your project's Libraries folder ➜ `Add Files to <...>`
2. Go to `node_modules` ➜ `react-native-background-upload` ➜ `ios` ➜ select `VydiaRNFileUploader.xcodeproj`
3. Add `VydiaRNFileUploader.a` to `Build Phases -> Link Binary With Libraries`

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


## Usage

```js
import Upload from 'react-native-background-upload'

const options = {
  url: 'https://myservice.com/path/to/post',
  path: 'file://path/to/file/on/device',
  method: 'POST',
  type: 'raw',
  headers: {
    'my-custom-header': 's3headervalueorwhateveryouneed'
  },
  // Below are options only supported on Android
  notification: {
    enabled: true
  }
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
  path: 'file://path/to/file/on/device',
  method: 'POST',
  field: 'uploaded_media',
  type: 'multipart'
}
```

Note the `field` property is required for multipart uploads.

## FAQs

Is there an example/sandbox app to test out this package?

> Yes, there is a simple react native app that comes with an [express](https://github.com/expressjs/express) server where you can see react-native-background-upload in action and try things out in an isolated local environment.

[ReactNativeBackgroundUploadExample](https://github.com/Vydia/ReactNativeBackgroundUploadExample)

Does it support iOS camera roll assets?

> No, they must be converted to a file asset.  The easist way to tell is that the url should always start with 'file://'.  If not, it won't work.  Things like [react-native-image-picker](https://github.com/marcshilling/react-native-image-picker) provide you with both.  PRs are welcome for this.

Does it support multiple file uploads?

> Yes and No.  It supports multiple concurrent uploads, but only a single upload per request.  That should be fine for 90%+ of cases.

Why should I use this file uploader instead of others that I've Googled like [react-native-uploader](https://github.com/aroth/react-native-uploader)?

> This package has two killer features not found anywhere else (as of 12/16/2016).  First, it works on both iOS and Android.  Others are iOS only.  Second, it supports background uploading.  This means that users can background your app and the upload will continue.  This does not happen with other uploaders.


## Contributing

See [CONTRIBUTING.md](https://github.com/Vydia/react-native-background-upload/CONTRIBUTING.md).


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

## Known issues

Android APK 27 and above require notifications to provide their own `NotificationChannel`. `react-native-background-upload` does not yet meet this requirement and thus [will cause crashes in Android 8.1 and above](https://github.com/Vydia/react-native-background-upload/issues/59#issuecomment-362476703). This issue can be avoided by electing not to use native notifications.

```js
const options = {
  // ...
  notification: {
    enabled: false,
  },
};
```


## Gratitude

Thanks to:
- [android-upload-service](https://github.com/gotev/android-upload-service)  It made Android dead simple to support.

- [MIME type from path on iOS](http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database)  Thanks for the answer!
