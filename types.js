// @flow
export type UploadEvent = 'progress' | 'error' | 'completed' | 'cancelled'

export type StartUploadArgs = {
  url: string,
  path: string,
  headers?: Object
}
