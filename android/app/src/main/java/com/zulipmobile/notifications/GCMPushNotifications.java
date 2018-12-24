package com.zulipmobile.notifications;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import com.zulipmobile.BuildConfig;
import com.zulipmobile.notifications.NotificationHelper.ConversationMap;
import com.zulipmobile.R;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import me.leolin.shortcutbadger.ShortcutBadger;

import static com.zulipmobile.notifications.NotificationHelper.buildNotificationContent;
import static com.zulipmobile.notifications.NotificationHelper.clearConversations;
import static com.zulipmobile.notifications.NotificationHelper.extractNames;
import static com.zulipmobile.notifications.NotificationHelper.extractTotalMessagesCount;
import static com.zulipmobile.notifications.NotificationHelper.addConversationToMap;
import static com.zulipmobile.notifications.NotificationHelper.removeMessageFromMap;
import static com.zulipmobile.notifications.NotificationHelper.TAG;

public class GCMPushNotifications {

    private static final int NOTIFICATION_ID = 435;
    static final String ACTION_CLEAR = "ACTION_CLEAR";
    static final String EXTRA_NOTIFICATION_DATA = "data";

    private static final String CHANNEL_PRIVATE_ID = "CHANNEL_PRIVATE";
    private static final String CHANNEL_GROUP_ID = "CHANNEL_GROUP";
    private static final String CHANNEL_STREAM_ID = "CHANNEL_STREAM";

    private static NotificationManager getNotificationManager(Context context) {
        return (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    }

    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= 26) {
            int importance = NotificationManager.IMPORTANCE_HIGH;
            List<NotificationChannel> channels = new ArrayList<>();
            channels.add(new NotificationChannel(CHANNEL_PRIVATE_ID, context.getString(R.string.notification_channel_private_name), importance));
            channels.add(new NotificationChannel(CHANNEL_GROUP_ID, context.getString(R.string.notification_channel_huddle_name), importance));
            channels.add(new NotificationChannel(CHANNEL_STREAM_ID, context.getString(R.string.notification_channel_stream_name), importance));
            getNotificationManager(context).createNotificationChannels(channels);
        }
    }

    private static void logNotificationData(Bundle data) {
        data.keySet(); // Has the side effect of making `data.toString` more informative.
        Log.v(TAG, "getPushNotification: " + data.toString(), new Throwable());
    }

    static void onReceived(Context context, ConversationMap conversations, Bundle data) {
        logNotificationData(data);
        final PushNotificationsProp props = new PushNotificationsProp(data);
        final String eventType = props.getEvent();
        switch (eventType) {
          case "message":
            addConversationToMap(props, conversations);
            updateNotification(context, conversations, props);
            break;
          case "remove":
            removeMessageFromMap(props, conversations);
            if (conversations.isEmpty()) {
                getNotificationManager(context).cancelAll();
            }
            break;
          default:
            Log.w(TAG, "Ignoring GCM message of unknown event type: " + eventType);
            break;
        }
    }

    private static void updateNotification(
            Context context, ConversationMap conversations, PushNotificationsProp props) {
        if (conversations.isEmpty()) {
            getNotificationManager(context).cancelAll();
            return;
        }
        final Notification notification = getNotificationBuilder(context, conversations, props).build();
        getNotificationManager(context).notify(NOTIFICATION_ID, notification);
    }

    private static Notification.Builder getNotificationBuilder(
            Context context, ConversationMap conversations, PushNotificationsProp props) {
        final Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ?
                new Notification.Builder(context, CHANNEL_STREAM_ID)
                : new Notification.Builder(context);

        final int messageId = props.getZulipMessageId();
        final Uri uri = Uri.fromParts("zulip", "msgid:" + Integer.toString(messageId), "");
        final Intent viewIntent = new Intent(Intent.ACTION_VIEW, uri, context, NotificationIntentService.class);
        viewIntent.putExtra(EXTRA_NOTIFICATION_DATA, props.asBundle());
        final PendingIntent viewPendingIntent =
                PendingIntent.getService(context, 0, viewIntent, 0);
        builder.setContentIntent(viewPendingIntent);

        builder.setDefaults(Notification.DEFAULT_ALL)
                .setAutoCancel(true);

        String type = props.getRecipientType();
        String content = props.getContent();
        String senderFullName = props.getSenderFullName();
        String avatarURL = props.getAvatarURL();
        String time = props.getTime();
        String stream = props.getStream();
        String topic = props.getTopic();
        String baseURL = props.getBaseURL();
        int totalMessagesCount = extractTotalMessagesCount(conversations);

        if (BuildConfig.DEBUG) {
            builder.setSmallIcon(R.mipmap.ic_launcher);
        } else {
            builder.setSmallIcon(R.drawable.zulip_notification);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && type.equals("private")) {
            if (props.getPmUsers() == null) {
                builder.setChannelId(CHANNEL_PRIVATE_ID);
            } else {
                builder.setChannelId(CHANNEL_GROUP_ID);
            }
        }

        if (conversations.size() == 1) {
            //Only one 1 notification therefore no using of big view styles
            if (totalMessagesCount > 1) {
                builder.setContentTitle(senderFullName + " (" + totalMessagesCount + ")");
            } else {
                builder.setContentTitle(senderFullName);
            }
            builder.setContentText(content);
            if (type.equals("stream")) {
                String displayTopic = stream + " > " + topic;
                builder.setSubText("Message on " + displayTopic);
            }
            if (avatarURL != null && avatarURL.startsWith("http")) {
                Bitmap avatar = fetchAvatar(NotificationHelper.sizedURL(context,
                        avatarURL, 64, baseURL));
                if (avatar != null) {
                    builder.setLargeIcon(avatar);
                }
            }
            builder.setStyle(new Notification.BigTextStyle().bigText(content));
        } else {
            String conversationTitle = String.format(Locale.ENGLISH, "%d messages in %d conversations", totalMessagesCount, conversations.size());
            builder.setContentTitle(conversationTitle);
            builder.setContentText("Messages from " + TextUtils.join(",", extractNames(conversations)));
            Notification.InboxStyle inboxStyle = new Notification.InboxStyle(builder);
            inboxStyle.setSummaryText(String.format(Locale.ENGLISH, "%d conversations", conversations.size()));
            buildNotificationContent(conversations, inboxStyle, context);
            builder.setStyle(inboxStyle);
        }

        try {
            ShortcutBadger.applyCount(context, totalMessagesCount);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }

        if (time != null) {
            long timeMillis = Long.parseLong(time) * 1000;
            builder.setWhen(timeMillis);
        }
        long[] vPattern = {0, 100, 200, 100};
        builder.setVibrate(vPattern);

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.KITKAT) {
            Intent dismissIntent = new Intent(context, NotificationIntentService.class);
            dismissIntent.setAction(ACTION_CLEAR);
            PendingIntent piDismiss = PendingIntent.getService(context, 0, dismissIntent, 0);
            Notification.Action action = new Notification.Action(android.R.drawable.ic_menu_close_clear_cancel, "Clear", piDismiss);
            builder.addAction(action);
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            AudioAttributes audioAttr = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION).build();
            builder.setSound(Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.zulip), audioAttr);
        } else {
            builder.setSound(Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.zulip));
        }
        return builder;
    }

    private static Bitmap fetchAvatar(URL url) {
        try {
            return NotificationHelper.fetch(url);
        } catch (IOException e) {
            Log.e(TAG, "ERROR: " + e.toString());
        }
        return null;
    }

    static void onOpened(Context context, ConversationMap conversations, Bundle data) {
        logNotificationData(data);
        NotifyReact.notifyReact(context, data);
        getNotificationManager(context).cancelAll();
        clearConversations(conversations);
        try {
            ShortcutBadger.removeCount(context);
        } catch (Exception e) {
            Log.e(TAG, "BADGE ERROR: " + e.toString());
        }
    }

    static void onClear (Context context, ConversationMap conversations) {
        clearConversations(conversations);
        getNotificationManager(context).cancelAll();
    }
}
