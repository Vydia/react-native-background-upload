package com.vydia.RNUploader;

import android.content.BroadcastReceiver;
import android.content.Context;
import androidx.annotation.Nullable;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import net.gotev.uploadservice.UploadService;

public class NotificationActionsReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationActionsReceiver";

    private ReactApplicationContext reactContext;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !NotificationActions.INTENT_ACTION.equals(intent.getAction())) {
            return;
        }

        if (NotificationActions.ACTION_CANCEL_UPLOAD.equals(intent.getStringExtra(NotificationActions.PARAM_ACTION))) {
            onUserRequestedUploadCancellation(context, intent.getStringExtra(NotificationActions.PARAM_UPLOAD_ID));
        }
    }

    private void onUserRequestedUploadCancellation(Context context, String uploadId) {
        Log.e("CANCEL_UPLOAD", "User requested cancellation of upload with ID: " + uploadId);
        UploadService.stopUpload(uploadId);

        WritableMap params = Arguments.createMap();
        params.putString("id", uploadId);
        sendEvent("cancelled", params, context);
    }

    /**
     * Sends an event to the JS module. 
     */
    private void sendEvent(String eventName, @Nullable WritableMap params, Context context) {
        if (reactContext != null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("RNFileUploader-" + eventName, params);
        } else {
            Log.e(TAG, "sendEvent() failed due reactContext == null!");
        }
    }

    /**
     * Register this notifcation receiver.<br>
     * If you use this receiver in an {@link android.app.Activity}, you have to call this method inside
     * {@link android.app.Activity#onResume()}, after {@code super.onResume();}.<br>
     * If you use it in a {@link android.app.Service}, you have to
     * call this method inside {@link android.app.Service#onCreate()}, after {@code super.onCreate();}.
     *
     * @param context context in which to register this receiver
     */
    public void register(final Context context) {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(NotificationActions.INTENT_ACTION);
        context.registerReceiver(this, intentFilter);

        this.reactContext = (ReactApplicationContext) context;
    }

    /**
     * Unregister this notification receiver.<br>
     * If you use this receiver in an {@link android.app.Activity}, you have to call this method inside
     * {@link android.app.Activity#onPause()}, after {@code super.onPause();}.<br>
     * If you use it in a {@link android.app.Service}, you have to
     * call this method inside {@link android.app.Service#onDestroy()}.
     *
     * @param context context in which to unregister this receiver
     */
    public void unregister(final Context context) {
        context.unregisterReceiver(this);

        this.reactContext = null;
    }
}
