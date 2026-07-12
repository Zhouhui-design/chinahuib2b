/**
 * PWA Registration Utility
 * Register service worker and handle PWA features
 */

export interface PWAStatus {
  isSupported: boolean;
  isRegistered: boolean;
  registration?: ServiceWorkerRegistration | null;
}

class PWAManager {
  private status: PWAStatus = {
    isSupported: false,
    isRegistered: false
  };

  constructor() {
    this.checkSupport();
  }

  /**
   * Check if PWA is supported
   */
  private checkSupport(): void {
    this.status.isSupported = 'serviceWorker' in navigator;
    
    if (!this.status.isSupported) {
      console.warn('[PWA] Service Worker not supported in this browser');
    }
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.status.isSupported) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/pwasw', {
        scope: '/'
      });

      this.status.isRegistered = true;
      this.status.registration = registration;

      console.log('[PWA] Service Worker registered:', registration.scope);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdate();
            }
          });
        }
      });

      await this.forceUpdate(registration);

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Force update check for service worker
   */
  async forceUpdate(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      const updateFound = await registration.update();
      if (updateFound) {
        console.log('[PWA] New Service Worker found, updating...');
      }
    } catch (e) {
      console.warn('[PWA] Force update check failed:', e);
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.status.registration) {
      return false;
    }

    try {
      const success = await this.status.registration.unregister();
      this.status.isRegistered = false;
      this.status.registration = null;
      
      console.log('[PWA] Service Worker unregistered');
      return success;
    } catch (error) {
      console.error('[PWA] Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[PWA] Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.status.registration) {
      console.warn('[PWA] Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.status.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'] || ''
        ) as BufferSource
      });

      console.log('[PWA] Subscribed to push notifications');
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Notify user about update
   */
  private notifyUpdate(): void {
    // Create custom event for React components to listen
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/icons/icon-192x192.png'
      });
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('[PWA] Failed to send subscription to server:', error);
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Get current status
   */
  getStatus(): PWAStatus {
    return { ...this.status };
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return this.status.isSupported && !this.status.isRegistered;
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

/**
 * React Hook for PWA
 */
export function usePWA() {
  const registerServiceWorker = async () => {
    return await pwaManager.register();
  };

  const requestNotifications = async () => {
    return await pwaManager.requestNotificationPermission();
  };

  const subscribeToPush = async () => {
    return await pwaManager.subscribeToPush();
  };

  return {
    isSupported: pwaManager.getStatus().isSupported,
    isRegistered: pwaManager.getStatus().isRegistered,
    registerServiceWorker,
    requestNotifications,
    subscribeToPush
  };
}
