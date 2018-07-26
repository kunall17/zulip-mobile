# Push notifications

Mobile devices support two types of notifications: local notifications
and remote, or push, notificiations.  Local notifications require no external
infrastructure and can be triggered by date, place, or time.  Push
notifications, on the other hand, are sent by some (authenticated) backend.

This doc describes how to develop, and locally test, push notifications in
Zulip Mobile.  We don't currently use local notifications.

## Testing client-side changes on iOS

The Apple Push Notification service (APNs) does not allow our production
bouncer to send notifications to a development build of the Zulip Mobile
app.

(Work in progress; given an appropriate dev certificate, we should be able
to send notifications to a dev build of the app through Apple's sandbox
instance of APNs.)

## Testing server-side changes (iOS or Android)

[Set up the dev server for mobile development](dev-server.md), with one
additional step:

* Before you run the server with `tools/run-dev.py`, register your
  development server with our production bouncer by running the following
  custom Django management command:

  ```
  python manage.py register_server --agree_to_terms_of_service
  ```

  This is a variation of our [instructions for production
  deployments](https://zulip.readthedocs.io/en/latest/production/mobile-push-notifications.html),
  adapted for the Zulip dev environment.

Now, follow the instructions in [dev-server.md](howto/dev-server.md) to log into
the dev server, using a production build of the app -- that is, the Zulip
app installed from the App Store or Play Store.

A tip for testing Zulip's push notifications: simulate a private
conversation between two users, and make sure that you don't have the Zulip
app open while you're doing so.  For example, if you've logged in as `Iago`
on your mobile device, log in as `Polonius` via a web browser, and send a PM
from `Polonius` to `Iago`.

You should see a push notification appear on the mobile device!
