# react-native-background-upload [![npm version](https://badge.fury.io/js/react-native-camera.svg)](https://badge.fury.io/js/react-native-camera)
Cross platform http post file uploader with android and iOS background support

## Installation

`npm install react-native-background-upload`

### Automatic Native Library Linking

`react-native link react-native-background-upload`

### Manual Native Library Linking

## Usage

```js
import Upload from 'react-native-background-upload'

const postUrl = "https://myservice.com/path/to/post"
const fileUrl = "file://path/to/file/on/device"
const headers = {
  "Content-Type": "video/quicktime"
}

Upload.addListener(function(event) {
  // event object has structure:
  // {
  //   type: 'progress'|'finished'
  //   progress: 0.0 - 100.0
  //   fileId: providedFileId
  // }
});

Upload.startUpload(postUrl, fileUrl, headers).then(function() {
  // upload has started
}, function() {
  // upload failed to start, bad post or file url?
});
```
