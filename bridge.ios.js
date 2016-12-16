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
 */
import { NativeModules, DeviceEventEmitter } from 'react-native'
import type { UploadEvent, StartUploadArgs } from './types'

const eventPrefix = 'RNFileUploader-'

const NativeModule = NativeModules.VydiaRNFileUploader
if (NativeModule) {
  // register event listeners or else they don't fire on DeviceEventEmitter.  TODO: ensure this is still the case, as it was in RN 0.36
  NativeModule.addListener(eventPrefix + 'progress')
  NativeModule.addListener(eventPrefix + 'error')
  NativeModule.addListener(eventPrefix + 'completed')
}

export const getFileInfo = (path: string): Promise<Object> => NativeModule.getFileInfo(path)

export const startUpload = (options: StartUploadArgs): Promise<string> => NativeModule.startUpload(options)

export const addListener = (eventType: UploadEvent, uploadId: string, listener: Function) => {
  return DeviceEventEmitter.addListener(eventPrefix + eventType, (data) => {
    if (!uploadId || !data || !data.id || data.id === uploadId) {
      listener(data)
    }
  })
}
