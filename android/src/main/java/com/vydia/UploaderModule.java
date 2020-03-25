package com.vydia.RNUploader;

import android.content.Context;
import android.os.Build;
import android.support.annotation.Nullable;
import android.util.Log;
import android.webkit.MimeTypeMap;

import com.facebook.react.bridge.LifecycleEventListener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.vydia.RNUploader.UploadReceiver;
import com.vydia.RNUploader.NotificationActionsReceiver;

import net.gotev.uploadservice.BinaryUploadRequest;
import net.gotev.uploadservice.HttpUploadRequest;
import net.gotev.uploadservice.MultipartUploadRequest;
import net.gotev.uploadservice.ServerResponse;
import net.gotev.uploadservice.UploadInfo;
import net.gotev.uploadservice.UploadNotificationConfig;
import net.gotev.uploadservice.UploadService;
import net.gotev.uploadservice.UploadStatusDelegate;
import net.gotev.uploadservice.okhttp.OkHttpStack;

import java.io.File;

/**
 * Created by stephen on 12/8/16.
 */
public class UploaderModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
  private static final String TAG = "UploaderBridge";

  private UploadReceiver uploadReceiver;
  private ReactApplicationContext reactContext;

  public UploaderModule(ReactApplicationContext reactContext) {
    super(reactContext);

    this.reactContext = reactContext;
    reactContext.addLifecycleEventListener(this);

    if (uploadReceiver == null) {
      uploadReceiver = new UploadReceiver();
      uploadReceiver.register(reactContext);
    }

    UploadService.NAMESPACE = reactContext.getApplicationInfo().packageName;
    UploadService.HTTP_STACK = new OkHttpStack();
  }

  @Override
  public String getName() {
    return "RNFileUploader";
  }



  /*
  Gets file information for the path specified.  Example valid path is: /storage/extSdCard/DCIM/Camera/20161116_074726.mp4
  Returns an object such as: {extension: "mp4", size: "3804316", exists: true, mimeType: "video/mp4", name: "20161116_074726.mp4"}
   */
  @ReactMethod
  public void getFileInfo(String path, final Promise promise) {
    try {
      WritableMap params = Arguments.createMap();
      File fileInfo = new File(path);
      params.putString("name", fileInfo.getName());
      if (!fileInfo.exists() || !fileInfo.isFile())
      {
        params.putBoolean("exists", false);
      }
      else
      {
        params.putBoolean("exists", true);
        params.putString("size",Long.toString(fileInfo.length())); //use string form of long because there is no putLong and converting to int results in a max size of 17.2 gb, which could happen.  Javascript will need to convert it to a number
        String extension = MimeTypeMap.getFileExtensionFromUrl(path);
        params.putString("extension",extension);
        String mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase());
        params.putString("mimeType", mimeType);
      }

      promise.resolve(params);
    } catch (Exception exc) {
      Log.e(TAG, exc.getMessage(), exc);
      promise.reject(exc);
    }
  }

  /*
   * Starts a file upload.
   * Returns a promise with the string ID of the upload.
   */
  @ReactMethod
  public void startUpload(ReadableMap options, final Promise promise) {
    for (String key : new String[]{"url", "path"}) {
      if (!options.hasKey(key)) {
        promise.reject(new IllegalArgumentException("Missing '" + key + "' field."));
        return;
      }
      if (options.getType(key) != ReadableType.String) {
        promise.reject(new IllegalArgumentException(key + " must be a string."));
        return;
      }
    }

    if (options.hasKey("headers") && options.getType("headers") != ReadableType.Map) {
      promise.reject(new IllegalArgumentException("headers must be a hash."));
      return;
    }

    if (options.hasKey("notification") && options.getType("notification") != ReadableType.Map) {
      promise.reject(new IllegalArgumentException("notification must be a hash."));
      return;
    }

    String requestType = "raw";

    if (options.hasKey("type")) {
      requestType = options.getString("type");
      if (requestType == null) {
        promise.reject(new IllegalArgumentException("type must be string."));
        return;
      }

      if (!requestType.equals("raw") && !requestType.equals("multipart")) {
        promise.reject(new IllegalArgumentException("type should be string: raw or multipart."));
        return;
      }
    }

    WritableMap notification = new WritableNativeMap();
    notification.putBoolean("enabled", true);

    if (options.hasKey("notification")) {
      notification.merge(options.getMap("notification"));
    }

    // On Android versions >= 8.0 Oreo is required by Google's policy to display a notification when a background service (such as uploading a file in the background) run.
    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      notification.putBoolean("enabled", true);
    }

    String url = options.getString("url");
    String filePath = options.getString("path");
    String method = options.hasKey("method") && options.getType("method") == ReadableType.String ? options.getString("method") : "POST";
    int maxRetries = options.hasKey("maxRetries") && options.getType("maxRetries") == ReadableType.Number ? options.getInt("maxRetries") : 2;

    final String customUploadId = options.hasKey("customUploadId") && options.getType("method") == ReadableType.String ? options.getString("customUploadId") : null;

    try {
      HttpUploadRequest<?> request;

      if (requestType.equals("raw")) {
        request = new BinaryUploadRequest(this.getReactApplicationContext(), customUploadId, url)
                .setFileToUpload(filePath);
      } else {
        if (!options.hasKey("field")) {
          promise.reject(new IllegalArgumentException("field is required field for multipart type."));
          return;
        }

        if (options.getType("field") != ReadableType.String) {
          promise.reject(new IllegalArgumentException("field must be string."));
          return;
        }

        request = new MultipartUploadRequest(this.getReactApplicationContext(), customUploadId, url)
                .addFileToUpload(filePath, options.getString("field"));
      }


      request.setMethod(method)
        .setMaxRetries(maxRetries)
        .setDelegate(null);

      if (notification.getBoolean("enabled")) {

        UploadNotificationConfig notificationConfig = new UploadNotificationConfig();

        if (notification.hasKey("notificationChannel")){
          notificationConfig.setNotificationChannelId(notification.getString("notificationChannel"));
        }

        if (notification.hasKey("autoClear") && notification.getBoolean("autoClear")){
          notificationConfig.getCompleted().autoClear = true;
          notificationConfig.getCancelled().autoClear = true;
          notificationConfig.getError().autoClear = true;
        }

        if (notification.hasKey("enableRingTone") && notification.getBoolean("enableRingTone")){
          notificationConfig.setRingToneEnabled(true);
        }

        if (notification.hasKey("onCompleteTitle")) {
          notificationConfig.getCompleted().title = notification.getString("onCompleteTitle");
        }

        if (notification.hasKey("onCompleteMessage")) {
          notificationConfig.getCompleted().message = notification.getString("onCompleteMessage");
        }

        if (notification.hasKey("onErrorTitle")) {
          notificationConfig.getError().title = notification.getString("onErrorTitle");
        }

        if (notification.hasKey("onErrorMessage")) {
          notificationConfig.getError().message = notification.getString("onErrorMessage");
        }

        if (notification.hasKey("onProgressTitle")) {
          notificationConfig.getProgress().title = notification.getString("onProgressTitle");
        }

        if (notification.hasKey("onProgressMessage")) {
          notificationConfig.getProgress().message = notification.getString("onProgressMessage");
        }

        if (notification.hasKey("onCancelledTitle")) {
          notificationConfig.getCancelled().title = notification.getString("onCancelledTitle");
        }

        if (notification.hasKey("onCancelledMessage")) {
          notificationConfig.getCancelled().message = notification.getString("onCancelledMessage");
        }

        request.setNotificationConfig(notificationConfig);

      }

      if (options.hasKey("parameters")) {
        if (requestType.equals("raw")) {
          promise.reject(new IllegalArgumentException("Parameters supported only in multipart type"));
          return;
        }

        ReadableMap parameters = options.getMap("parameters");
        ReadableMapKeySetIterator keys = parameters.keySetIterator();

        while (keys.hasNextKey()) {
          String key = keys.nextKey();

          if (parameters.getType(key) != ReadableType.String) {
            promise.reject(new IllegalArgumentException("Parameters must be string key/values. Value was invalid for '" + key + "'"));
            return;
          }

          request.addParameter(key, parameters.getString(key));
        }
      }

      if (options.hasKey("headers")) {
        ReadableMap headers = options.getMap("headers");
        ReadableMapKeySetIterator keys = headers.keySetIterator();
        while (keys.hasNextKey()) {
          String key = keys.nextKey();
          if (headers.getType(key) != ReadableType.String) {
            promise.reject(new IllegalArgumentException("Headers must be string key/values.  Value was invalid for '" + key + "'"));
            return;
          }
          request.addHeader(key, headers.getString(key));
        }
      }

      String uploadId = request.startUpload();
      promise.resolve(uploadId);
    } catch (Exception exc) {
      Log.e(TAG, exc.getMessage(), exc);
      promise.reject(exc);
    }
  }

  /*
   * Cancels file upload
   * Accepts upload ID as a first argument, this upload will be cancelled
   * Event "cancelled" will be fired when upload is cancelled.
   */
  @ReactMethod
  public void cancelUpload(String cancelUploadId, final Promise promise) {
    if (!(cancelUploadId instanceof String)) {
      promise.reject(new IllegalArgumentException("Upload ID must be a string"));
      return;
    }
    try {
      UploadService.stopUpload(cancelUploadId);
      promise.resolve(true);
    } catch (Exception exc) {
      Log.e(TAG, exc.getMessage(), exc);
      promise.reject(exc);
    }
  }

  @Override
  public void onHostResume() {
    if (uploadReceiver != null) {
      uploadReceiver.register(reactContext);
    }
  }

  @Override
  public void onHostPause() {
  }

  @Override
  public void onHostDestroy() {
    try {
      uploadReceiver.unregister(reactContext);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
