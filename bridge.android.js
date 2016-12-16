// @flow
/**
 * Handles file uploads from an Android device.
 *
 * Functions:
 * startUpload - starts an upload.  Returns a promise that resolves to the upload's string ID
 * addListener - adds an event listener.  args: (eventName: string, uploadId: string, callback: function ).  Returns a subscription that you can call remove() on later
 *
 * Events:
 * progress - { id: string, progress: int (0-100) }
 * error - { id: string, error: string }
 * completed - { id: string }
 * cancellled - { id: string }
 *
 *
 */
import { NativeModules, DeviceEventEmitter } from 'react-native'
import type { UploadEvent, StartUploadArgs } from './types'

const NativeModule = NativeModules.RNFileUploader

export const getFileInfo = (path: string): Promise<Object> => {
  return NativeModule.getFileInfo(path)
  .then(data => {
    if (data.size) {  // size comes back as a string on android so we convert it here
      data.size = +data.size
    }
    return data
  })
}

export const startUpload = (options: StartUploadArgs): Promise<string> => NativeModule.startUpload(options)

export const addListener = (eventType: UploadEvent, uploadId: string, listener: Function) => {
  return DeviceEventEmitter.addListener(`RNFileUploader-${eventType}`, (data) => {
    if (!uploadId || !data || !data.id || data.id === uploadId) {
      listener(data)
    }
  })
}
