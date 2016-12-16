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
    package com.vydia // <-- add this import
    
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
  url: 'https://myservice.com/path/to/post'
  path: 'file://path/to/file/on/device'
  headers: {
    'my-custom-header': 's3headervalueorwhateveryouneed'
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
