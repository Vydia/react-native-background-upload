package com.vydia.RNUploader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.IBinder;
import android.support.annotation.RequiresApi;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;

public class UploadEventsService extends Service {

    private UploadReceiver uploadReceiver;


    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String channelId = "io.brandcamp.app.upload_channel";

        Notification notification = new NotificationCompat.Builder(this, channelId)
                .setContentTitle("Upload Progress")
                .setContentText("Upload Progress is running")
                .setSmallIcon(android.R.drawable.ic_menu_upload)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();

        startForeground(3, notification);

        if (uploadReceiver == null) {
            uploadReceiver = new UploadReceiver();
            uploadReceiver.register(getApplicationContext());
        }

        return START_STICKY;
    }


    public void onDestroy() {
        try {
            uploadReceiver.unregister(getApplicationContext());
        } catch (Exception e) {
            // TODO: handle exception
        }
        super.onDestroy();
    }
}
