// ═══════════════════════════════════════════════════════════
// ZenFlow Push Client — saves Web Push subscription to Supabase
// ═══════════════════════════════════════════════════════════

import { supabase } from './supabaseClient';

// VAPID public key (matches the private key stored in the Edge Function secret)
export const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-1CWJlG9MkmOJQoX4bT7HXrp6pP4j4BCMvR4-4U1J2WbzBNW-5sO5_Pq_PeE';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Subscribes the browser to Web Push and saves the subscription to Supabase.
 * @param {string} userId - The authenticated user's ID
 * @returns {PushSubscription|null}
 */
export async function subscribeToPush(userId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[Push] Web Push not supported in this browser.');
        return null;
    }

    try {
        const reg = await navigator.serviceWorker.ready;

        // Check if already subscribed
        let subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
            subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
        }

        const json = subscription.toJSON();

        // Save/update in Supabase (upsert by endpoint)
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(
                {
                    user_id: userId,
                    endpoint: json.endpoint,
                    p256dh: json.keys.p256dh,
                    auth_key: json.keys.auth,
                },
                { onConflict: 'endpoint' }
            );

        if (error) {
            console.error('[Push] Error saving subscription:', error.message);
        } else {
            console.log('[Push] Subscription saved ✓');
        }

        return subscription;
    } catch (err) {
        console.error('[Push] Subscribe failed:', err);
        return null;
    }
}
