let paypalSdkLoaded = false;
let paypalLoadPromise: Promise<void> | null = null;

export const loadPayPalSdk = (clientId: string): Promise<void> => {
    if (paypalSdkLoaded) {
        return Promise.resolve();
    }

    if (paypalLoadPromise) {
        return paypalLoadPromise;
    }

    paypalLoadPromise = new Promise((resolve, reject) => {
        // Remove existing PayPal script if any
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
        script.async = true;
        
        script.onload = () => {
            paypalSdkLoaded = true;
            resolve();
        };
        
        script.onerror = () => {
            paypalSdkLoaded = false;
            paypalLoadPromise = null;
            reject(new Error('Failed to load PayPal SDK'));
        };

        document.head.appendChild(script);
    });

    return paypalLoadPromise;
};

export const isPayPalSdkLoaded = (): boolean => paypalSdkLoaded;
