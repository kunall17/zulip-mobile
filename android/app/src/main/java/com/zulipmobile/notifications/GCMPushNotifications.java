package com.zulipmobile.notifications;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.util.Pair;

import com.wix.reactnativenotifications.core.AppLaunchHelper;
import com.wix.reactnativenotifications.core.AppLifecycleFacade;
import com.wix.reactnativenotifications.core.JsIOHelper;
import com.wix.reactnativenotifications.core.ProxyService;
import com.wix.reactnativenotifications.core.notification.PushNotification;
import com.zulipmobile.R;

import java.io.IOException;
import java.net.URL;
import java.util.LinkedHashMap;
import java.util.Locale;

import static com.zulipmobile.notifications.NotificationHelper.buildNotificationContent;
import static com.zulipmobile.notifications.NotificationHelper.clearConversations;
import static com.zulipmobile.notifications.NotificationHelper.extractNames;
import static com.zulipmobile.notifications.NotificationHelper.extractTotalMessagesCount;

public class GCMPushNotifications extends PushNotification {

    private static final int NOTIFICATION_ID = 435;
    public static final String ACTION_NOTIFICATIONS_DISMISS = "ACTION_NOTIFICATIONS_DISMISS";
    private LinkedHashMap<String, Pair<String, Integer>> conversations;

    /**
     * Same as {@link com.wix.reactnativenotifications.core.NotificationIntentAdapter#PUSH_NOTIFICATION_EXTRA_NAME}
     */
    private static final String PUSH_NOTIFICATION_EXTRA_NAME = "pushNotification";

    public GCMPushNotifications(Context context, Bundle bundle, AppLifecycleFacade appLifecycleFacade, AppLaunchHelper appLaunchHelper, JsIOHelper jsIoHelper, LinkedHashMap<String, Pair<String, Integer>> conversations) {
        super(context, bundle, appLifecycleFacade, appLaunchHelper, jsIoHelper);
        this.conversations = conversations;
    }

    @Override
    protected PushNotificationsProp createProps(Bundle bundle) {
        return new PushNotificationsProp(bundle);
    }

    protected PushNotificationsProp getProps() {
        return (PushNotificationsProp) mNotificationProps;
    }


    @Override
    public void onOpened() {
        super.onOpened();
        clearConversations(conversations);
    }


    @Override
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        // First, get a builder initialized with defaults from the core class.
        final Notification.Builder builder = super.getNotificationBuilder(intent);

        String type = getProps().getRecipientType();
        String content = getProps().getContent();
        String title = getProps().getSenderFullName();
        String avatarURL = getProps().getAvatarURL();
        String time = getProps().getTime();
        String stream = getProps().getStream();
        String topic = getProps().getTopic();
        String baseURL = getProps().getBaseURL();

        builder.setSmallIcon(R.drawable.zulip_notification);
        builder.setAutoCancel(true);
        builder.setContentText(content);

        if (conversations.size() == 1) {
            //Only one 1 notification therefore no using of big view styles
            builder.setContentTitle(title);
            if (type.equals("stream")) {
                if (Build.VERSION.SDK_INT >= 16) {
                    String displayTopic = stream + " > "
                            + topic;
                    builder.setSubText("Mention on " + displayTopic);
                }
            }
            if (avatarURL != null && avatarURL.startsWith("http")) {
                Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(mContext,
                        avatarURL, 64, baseURL));
                if (avatar != null) {
                    builder.setLargeIcon(avatar);
                }
            }
        } else {
            builder.setContentTitle(String.format(Locale.ENGLISH, "%d messages in %d conversations", extractTotalMessagesCount(conversations), conversations.size()));
            builder.setStyle(new Notification.BigTextStyle().bigText(buildNotificationContent(conversations)));
            builder.setContentText("Messages from " + TextUtils.join(",", extractNames(conversations)));
        }
        if (time != null) {
            long timStamp = Long.parseLong(getProps().getTime()) * 1000;
            builder.setWhen(timStamp);
        }
        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);


        /**
         * Ideally, actions are sent using dismissIntent.setAction(String),
         * But here {@link com.wix.reactnativenotifications.core.NotificationIntentAdapter#extractPendingNotificationDataFromIntent(Intent)}
         * it checks in the bundle hence, An empty bundle is sent and checked in
         * {@link com.zulipmobile.MainApplication#getPushNotification} for this string and then dismissed
         *
         **/
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(mContext, ProxyService.class);
            Bundle bundle = new Bundle();
            bundle.putString(ACTION_NOTIFICATIONS_DISMISS, ACTION_NOTIFICATIONS_DISMISS);
            dismissIntent.putExtra(PUSH_NOTIFICATION_EXTRA_NAME, bundle);
            PendingIntent piDismiss = PendingIntent.getService(mContext, 0, dismissIntent, 0);
            Notification.Action action = new Notification.Action(android.R.drawable.ic_notification_clear_all, "Clear", piDismiss);
            builder.addAction(action);
        }
        return builder;
    }

    private Bitmap fetchAvatar(URL url) {
        try {
            return NotificationHelper.fetch(url);
        } catch (IOException e) {
            Log.e("ERROR", e.toString());
        }
        return null;
    }

    @Override
    protected int createNotificationId(Notification notification) {
        return NOTIFICATION_ID;
    }
}
