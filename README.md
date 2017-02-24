# react-native-background-upload [![npm version](https://badge.fury.io/js/react-native-background-upload.svg)](https://badge.fury.io/js/react-native-background-upload)
The only React Native http post file uploader with android and iOS background support.  If you are uploading large files like videos, use this so your users can background your app during a long upload.

## Installation

`npm install react-native-background-upload`

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
2. Add the compile line to the dependencies in `android/app/build.gradle`:

    ```gradle
    dependencies {
        compile project(':react-native-background-upload')
    }
    ```
3. Add the import and link the package in `MainApplication.java`:

    ```java
    import com.vydia.UploaderReactPackage; // <-- add this import

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

## Usage

```js
import Upload from 'react-native-background-upload'

const options {
  url: 'https://myservice.com/path/to/post',
  path: 'file://path/to/file/on/device',
  method: 'POST',
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
  Upload.addListener('progress',uploadId, (data) => {
    console.log(`Progress: ${data.progress}%`)
  })
  Upload.addListener('error',uploadId, (data) => {
    console.log(`Error: ${data.error}%`)
  })
  Upload.addListener('completed',uploadId, (data) => {
    console.log(`Completed!`)
  })
}).catch(function(err) {
  console.log('Upload error!',err)
});
```

## FAQs

Does it support iOS camera roll assets?

> No, they must be converted to a file asset.  The easist way to tell is that the url should always start with 'file://'.  If not, it won't work.  Things like [react-native-image-picker](https://github.com/marcshilling/react-native-image-picker) provide you with both.  PRs are welcome for this.

Does it support multiple file uploads?

> Yes and No.  It supports multiple concurrent uploads, but only a single upload per request.  That should be fine for 90%+ of cases.

Why should I use this file uploader instead of others that I've Googled like [react-native-uploader](https://github.com/aroth/react-native-uploader)?

> This package has two killer features not found anywhere else (as of 12/16/2016).  First, it works on both iOS and Android.  Others are iOS only.  Second, it supports background uploading.  This means that users can background your app and the upload will continue.  This does not happen with other uploaders.

## Gratitude

Thanks to:
- [android-upload-service](https://github.com/gotev/android-upload-service)  It made Android dead simple to support.  

- [MIME type from path on iOS](http://stackoverflow.com/questions/2439020/wheres-the-iphone-mime-type-database)  Thanks for the answer!

