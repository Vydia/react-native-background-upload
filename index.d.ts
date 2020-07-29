declare module "react-native-background-upload" {

    export interface EventData {
        id: string;
    }

    export interface ProgressData extends EventData {
        progress: number
    }

    export interface ErrorData extends EventData {
        error: string
    }

    export interface CompletedData extends EventData {

        responseCode: number
        responseBody: string
    }
    export type FileInfo = {
        name: string
        exists: boolean
        size?: number
        extension?: string
        mimeType?: string
    }


    export type NotificationOptions = {
        /**
         * Enable or diasable notifications. Works only on Android version < 8.0 Oreo. On Android versions >= 8.0 Oreo is required by Google's policy to display a notification when a background service run  { enabled: true }
         */
        enabled: boolean
        /**
         * Autoclear notification on complete  { autoclear: true }
         */
        autoClear: boolean
        /**
         * Sets android notificaion channel  { notificationChannel: "My-Upload-Service" }
         */
        notificationChannel: string
        /**
         * Sets whether or not to enable the notification sound when the upload gets completed with success or error   { enableRingTone: true }
         */
        enableRingTone: boolean
        /**
         * Sets notification progress title  { onProgressTitle: "Uploading" }
         */
        onProgressTitle: string
        /**
         * Sets notification progress message  { onProgressMessage: "Uploading new video" }
         */
        onProgressMessage: string
        /**
         * Sets notification complete title  { onCompleteTitle: "Upload finished" }
         */
        onCompleteTitle: string
        /**
         * Sets notification complete message  { onCompleteMessage: "Your video has been uploaded" }
         */
        onCompleteMessage: string
        /**
         * Sets notification error title   { onErrorTitle: "Upload error" }
         */
        onErrorTitle: string
        /**
         * Sets notification error message   { onErrorMessage: "An error occured while uploading a video" }
         */
        onErrorMessage: string
        /**
         * Sets notification cancelled title   { onCancelledTitle: "Upload cancelled" }
         */
        onCancelledTitle: string
        /**
         * Sets notification cancelled message   { onCancelledMessage: "Video upload was cancelled" }
         */
        onCancelledMessage: string
    }

    export interface UploadOptions {
        url: string;
        path: string;
        type?: 'raw' | 'multipart';
        method?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
        customUploadId?: string;
        headers?: {
            [index: string]: string
        };
        // Android notification settings
        notification?: Partial<NotificationOptions>
        /**
         * AppGroup defined in XCode for extensions. Necessary when trying to upload things via this library
         * in the context of ShareExtension.
         */
        appGroup?: string;
        // Necessary only for multipart type upload
        field?: string
    }

    export interface MultipartUploadOptions extends UploadOptions {
        type: 'multipart'
        field: string
        parameters?: {
            [index: string]: string
        }
    }

    type uploadId = string

    export type UploadListenerEvent = 'progress' | 'error' | 'completed' | 'cancelled'


    export default class Upload {
        static startUpload(options: UploadOptions | MultipartUploadOptions): Promise<uploadId>
        static addListener(event: 'progress', uploadId: uploadId, callback: (data: ProgressData ) => void): void
        static addListener(event: 'error', uploadId: uploadId, callback: (data: ErrorData) => void): void
        static addListener(event: 'completed', uploadId: uploadId, callback: (data: CompletedData) => void): void
        static addListener(event: 'cancelled', uploadId: uploadId, callback: (data: EventData) => void): void
        static getFileInfo(path: string): Promise<FileInfo>
        static cancelUpload(uploadId: uploadId): Promise<boolean>
    }

}
