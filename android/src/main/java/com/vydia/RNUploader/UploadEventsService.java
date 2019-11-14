package com.vydia.RNUploader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

import androidx.annotation.RequiresApi;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.jstasks.HeadlessJsTaskContext;

public class UploadEventsService extends HeadlessJsTaskService {

    public static final String START_FOREGROUND_ACTION = "start_upload_events";
    public static final String STOP_FOREGROUND_ACTION = "stop_upload_events";

    public static final String ARG_NOTIFICATION_OPTIONS = "arg_notification_options";

    public static final int SERVICE_ID = 33221100; //Something unique

    private UploadReceiver uploadReceiver;


    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent.getAction().equals(START_FOREGROUND_ACTION)) {
            return startService(intent.getBundleExtra(ARG_NOTIFICATION_OPTIONS));
        } else if (intent.getAction().equals(STOP_FOREGROUND_ACTION)) {
            return stopService();
        }

        return START_NOT_STICKY;
    }

    private int startService(Bundle notificationOptions) {
        if (!notificationOptions.containsKey("notificationChannel")) {
            throw new IllegalArgumentException("notificationChannel is required");
        }

        String channelId = "";

        String channelName = "Upload Progress Channel";

        if (notificationOptions.containsKey("notificationChannelName")) {
            channelName = notificationOptions.getString("notificationChannelName");
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            channelId = createNotificationChannel(notificationOptions.getString("notificationChannel"), channelName);
        }

        String title = "Upload Progress";

        if (notificationOptions.containsKey("notificationTitle")) {
            title = notificationOptions.getString("notificationTitle");
        }

        String text = "Waiting for upload progress to finish";

        if (notificationOptions.containsKey("notificationText")) {
            text = notificationOptions.getString("notificationText");
        }

        Notification notification = new NotificationCompat.Builder(this, channelId)
                .setContentTitle(title)
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_menu_upload)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();

        startForeground(SERVICE_ID, notification);

        if (uploadReceiver == null) {

            final ReactInstanceManager reactInstanceManager =
                    getReactNativeHost().getReactInstanceManager();

            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext == null) {
                reactInstanceManager.addReactInstanceEventListener(
                        new ReactInstanceManager.ReactInstanceEventListener() {
                            @Override
                            public void onReactContextInitialized(ReactContext reactContext) {

                                uploadReceiver = new UploadReceiver();
                                uploadReceiver.register(reactContext);
                                reactInstanceManager.removeReactInstanceEventListener(this);
                            }
                        });
                reactInstanceManager.createReactContextInBackground();
            } else {
                uploadReceiver = new UploadReceiver();
                uploadReceiver.register(reactContext);
            }
        }

        return START_STICKY;
    }

    private int stopService() {
        stopForeground(true);
        stopSelf();

        return START_NOT_STICKY;
    }


    public void onDestroy() {
        try {
            if (getReactNativeHost().hasInstance()) {
                ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
                ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
                if (reactContext != null) {
                    HeadlessJsTaskContext headlessJsTaskContext =
                            HeadlessJsTaskContext.getInstance(reactContext);
                    headlessJsTaskContext.removeTaskEventListener(this);
                    uploadReceiver.unregister(reactContext);
                }
            }

        } catch (Exception e) {
            // TODO: handle exception
        }
        super.onDestroy();
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private String createNotificationChannel(String channelId, String channelName) {
        NotificationChannel chan = new NotificationChannel(channelId,
                channelName, NotificationManager.IMPORTANCE_DEFAULT);

        NotificationManager service = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        service.createNotificationChannel(chan);
        return channelId;
    }

    public static void start(Bundle notificationOptions, Context context) {
        Intent intent = new Intent(context, UploadEventsService.class);
        intent.putExtra(ARG_NOTIFICATION_OPTIONS, notificationOptions);
        intent.setAction(START_FOREGROUND_ACTION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stop(Context context) {
        Intent intent = new Intent(context, UploadEventsService.class);
        intent.setAction(STOP_FOREGROUND_ACTION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }
}
