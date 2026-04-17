import webpush from 'web-push';
import { query } from '@/db';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:example@yourdomain.com';

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidEmail, publicVapidKey, privateVapidKey);
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string }) {
  try {
    const result = await query('SELECT subscription FROM push_subscriptions WHERE user_id = $1', [userId]);
    
    if (result.rowCount === 0) {
      console.log(`No push subscription found for user ${userId}`);
      return;
    }

    const subscriptions = result.rows;

    const notifications = subscriptions.map(async (row) => {
      const subscription = row.subscription;
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          console.log(`Removing expired subscription for user ${userId}`);
          await query('DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription = $2', [userId, JSON.stringify(subscription)]);
        } else {
          console.error('Error sending push notification:', error);
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}
