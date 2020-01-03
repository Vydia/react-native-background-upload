/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import { throttle } from 'lodash'
import {
  AppRegistry,
  Button,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import Upload from 'react-native-background-upload'
import ImagePicker from 'react-native-image-picker'

export default class ReactNativeBackgroundUploadExample extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isImagePickerShowing: false,
      uploadId: null,
      progress: null,
    }
  }

  handleProgress = throttle((progress) => {
    this.setState({ progress })
  }, 200)

  startUpload = (opts) => {
    Upload.getFileInfo(opts.path).then((metadata) => {
      const options = Object.assign({
        method: 'POST',
        headers: {
          'content-type': metadata.mimeType // server requires a content-type header
        }
      }, opts)

      Upload.startUpload(options).then((uploadId) => {
        console.log(`Upload started with options: ${JSON.stringify(options)}`)
        this.setState({ uploadId, progress: 0 })
        Upload.addListener('progress', uploadId, (data) => {
          this.handleProgress(+data.progress)
          console.log(`Progress: ${data.progress}%`)
        })
        Upload.addListener('error', uploadId, (data) => {
          console.log(`Error: ${data.error}%`)
        })
        Upload.addListener('completed', uploadId, (data) => {
          console.log('Completed!')
        })
      }).catch(function(err) {
        this.setState({ uploadId: null, progress: null })
        console.log('Upload error!', err)
      })
    })
  }

  onPressUpload = (options) => {
    if (this.state.isImagePickerShowing) {
      return
    }

    this.setState({ isImagePickerShowing: true })

    const imagePickerOptions = {
      takePhotoButtonTitle: null,
      title: 'Upload Media',
      chooseFromLibraryButtonTitle: 'Choose From Library'
    }

    ImagePicker.showImagePicker(imagePickerOptions, (response) => {
      let didChooseVideo = true

      console.log('ImagePicker response: ', response)
      const { customButton, didCancel, error, path, uri } = response

      if (didCancel) {
        didChooseVideo = false
      }

      if (error) {
        console.warn('ImagePicker error:', response)
        didChooseVideo = false
      }

      // TODO: Should this happen higher?
      this.setState({ isImagePickerShowing: false })

      if (!didChooseVideo) {
        return
      }

      if (Platform.OS === 'android') {
        if (path) { // Video is stored locally on the device
          // TODO: What here?
          this.startUpload(Object.assign({ path }, options))
        } else { // Video is stored in google cloud
          // TODO: What here?
          this.props.onVideoNotFound()
        }
      } else {
        this.startUpload(Object.assign({ path: uri }, options))
      }
    })
  }

  cancelUpload = () => {
    if (!this.state.uploadid) {
      console.log('Nothing to cancel!')
      return
    }

    Upload.cancelUpload(this.state.uploadId).then((props) => {
      console.log(`Upload ${this.state.uploadId} canceled`)
      this.setState({ uploadId: null, progress: null })
    })
  }

  render() {
    return (
      <View>
        <View>
          <Button
            title="Tap To Upload Raw"
            onPress={() => this.onPressUpload({
              url: 'http://localhost:3000/upload_raw',
              type: 'raw'
            })}
          />
          <View/>
          <Button
            title="Tap To Upload Multipart"
            onPress={() => this.onPressUpload({
              url: 'http://localhost:3000/upload_multipart',
              field: 'uploaded_media',
              type: 'multipart'
            })}
          />
          <View style={{ height: 32 }}/>
          <Text style={{ textAlign: 'center' }}>
            { `Current Upload ID: ${this.state.uploadId === null ? 'none' : this.state.uploadId}` }
          </Text>
          <Text style={{ textAlign: 'center' }}>
            { `Progress: ${this.state.progress === null ? 'none' : `${this.state.progress}%`}` }
          </Text>
          <View/>
          <Button
            title="Tap to Cancel Upload"
            onPress={this.cancelUpload}
          />
        </View>
      </View>
    )
  }
}
