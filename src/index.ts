/**
 * Handles HTTP background file uploads from an iOS or Android device.
 */
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import type { EventSubscription } from 'react-native';

export type UploadEvent =
  | 'progress'
  | 'error'
  | 'completed'
  | 'cancelled'
  | 'bgExpired';

export type NotificationArgs = {
  enabled: boolean;
};

export type StartUploadArgs = {
  url: string;
  // Optional, if not given, must be multipart, can be used to upload form data
  path?: string;
  method?: 'PUT' | 'POST';
  // Optional, because raw is default
  type?: 'raw' | 'multipart';
  // This option is needed for multipart type
  field?: string;
  customUploadId?: string;
  // parameters are supported only in multipart type
  parameters?: Record<string, string>;
  headers?: Object;
  notification?: NotificationArgs;
};

const NativeModule =
  NativeModules.VydiaRNFileUploader || NativeModules.RNFileUploader; // iOS is VydiaRNFileUploader and Android is RNFileUploader
const eventPrefix = 'RNFileUploader-';

const eventEmitter = new NativeEventEmitter(NativeModule);

// add event listeners so they always fire on the native side
// no longer needed.
// if (Platform.OS === 'ios') {
//   const identity = () => {};
//   eventEmitter.addListener(eventPrefix + 'progress', identity);
//   eventEmitter.addListener(eventPrefix + 'error', identity);
//   eventEmitter.addListener(eventPrefix + 'cancelled', identity);
//   eventEmitter.addListener(eventPrefix + 'completed', identity);
//   eventEmitter.addListener(eventPrefix + 'bgExpired', identity);
// }

/*
Gets file information for the path specified.
Example valid path is:
  Android: '/storage/extSdCard/DCIM/Camera/20161116_074726.mp4'
  iOS: 'file:///var/mobile/Containers/Data/Application/3C8A0EFB-A316-45C0-A30A-761BF8CCF2F8/tmp/trim.A5F76017-14E9-4890-907E-36A045AF9436.MOV;

Returns an object:
  If the file exists: {extension: "mp4", size: "3804316", exists: true, mimeType: "video/mp4", name: "20161116_074726.mp4"}
  If the file doesn't exist: {exists: false} and might possibly include name or extension

The promise should never be rejected.
*/
export const getFileInfo = (path: string): Promise<Object> => {
  return NativeModule.getFileInfo(path).then((data: any) => {
    if (data.size) {
      // size comes back as a string on android so we convert it here.  if it's already a number this won't hurt anything
      data.size = +data.size;
    }
    return data;
  });
};

/*
Starts uploading a file to an HTTP endpoint.
Options object:
{
  url: string.  url to post to.
  path: string.  path to the file on the device none for no file
  headers: hash of name/value header pairs
  method: HTTP method to use.  Default is "POST"
  notification: hash for customizing tray notification
    enabled: boolean to enable/disabled notifications, true by default.
}

Returns a promise with the string ID of the upload.  Will reject if there is a connection problem, the file doesn't exist, or there is some other problem.

It is recommended to add listeners in the .then of this promise.

*/
export const startUpload = (options: StartUploadArgs): Promise<string> =>
  NativeModule.startUpload(options);

/*
Cancels active upload by string ID of the upload.

Upload ID is returned in a promise after a call to startUpload method,
use it to cancel started upload.

Event "cancelled" will be fired when upload is cancelled.

Returns a promise with boolean true if operation was successfully completed.
Will reject if there was an internal error or ID format is invalid.

*/
export const cancelUpload = (cancelUploadId: string): Promise<boolean> => {
  if (typeof cancelUploadId !== 'string') {
    return Promise.reject(new Error('Upload ID must be a string'));
  }
  return NativeModule.cancelUpload(cancelUploadId);
};

/*
Listens for the given event on the given upload ID (resolved from startUpload).
If you don't supply a value for uploadId, the event will fire for all uploads.
Events (id is always the upload ID):
  progress - { id: string, progress: int (0-100) }
  error - { id: string, error: string }
  cancelled - { id: string, error: string }
  completed - { id: string }
*/
export const addListener = (
  eventType: UploadEvent,
  uploadId: string,
  listener: Function,
): EventSubscription => {
  return eventEmitter.addListener(eventPrefix + eventType, data => {
    if (!uploadId || !data || !data.id || data.id === uploadId) {
      listener(data);
    }
  });
};

// call this to let the OS it can suspend again
// it will be called after a short timeout if it isn't called at all
export const canSuspendIfBackground = () => {
  if (Platform.OS === 'ios') {
    NativeModule.canSuspendIfBackground();
  }
};

// returns remaining background time in seconds
export const getRemainingBgTime = (): Promise<number> => {
  if (Platform.OS === 'ios') {
    return NativeModule.getRemainingBgTime();
  }
  return Promise.resolve(10 * 60 * 24); // dummy for android, large number
};

// marks the beginning of a background task and returns its ID
// in order to request extra background time
// do not call more than once without calling endBackgroundTask
// useful if we need to do more background processing in addition to network requests
// canSuspendIfBackground should still be called in case we run out of time.
export const beginBackgroundTask = (): Promise<number> => {
  if (Platform.OS === 'ios') {
    return NativeModule.beginBackgroundTask();
  }
  return Promise.resolve(-1); // TODO: dummy for android
};

// marks the end of background task using the id returned by begin
// failing to call this might end up on app termination
export const endBackgroundTask = (id: number) => {
  if (Platform.OS === 'ios') {
    NativeModule.endBackgroundTask(id);
  }
};

export default {
  startUpload,
  cancelUpload,
  addListener,
  getFileInfo,
  canSuspendIfBackground,
  getRemainingBgTime,
  beginBackgroundTask,
  endBackgroundTask,
};
