
import { IPlatformAdapter, IAuthService, IAdService, IIAPService, ISocialService, AuthResult, Product } from '../../types/platform';
import { UserProfile, SocialProvider } from '../../types';
import { getCurrentUser, getUserProfile, signInWithProvider, loginAsGuest, signOut, upsertUserProfile, getFriends } from '../cloudService';

// --- WEB AUTH ---
class WebAuth implements IAuthService {
    getSupportedProviders(): SocialProvider[] {
        return [SocialProvider.GOOGLE, SocialProvider.FACEBOOK, SocialProvider.WECHAT, SocialProvider.DOUYIN];
    }

    async checkSession(): Promise<AuthResult> {
        const user = await getCurrentUser();
        if (user) {
            const profile = await getUserProfile(user.id);
            if (profile) return { success: true, user: profile };
        }
        return { success: false };
    }

    async login(provider?: SocialProvider): Promise<AuthResult> {
        if (!provider) return { success: false, error: "Provider required for Web" };

        // Handle Guest/Mock flows (WeChat/Douyin in browser)
        if (provider === SocialProvider.WECHAT || provider === SocialProvider.DOUYIN) {
            const { user } = await loginAsGuest(provider);
            const profile = await getUserProfile(user.id);
            return { success: true, user: profile || undefined };
        }

        // Handle Standard OAuth
        const { data, error } = await signInWithProvider(provider);
        if (error) return { success: false, error: JSON.stringify(error) };
        
        // Note: OAuth usually redirects, so this might not complete in-page unless using popup flow
        return { success: true };
    }

    async logout(): Promise<void> {
        await signOut();
    }
}

// --- WEB ADS (Mock / Google AdSense placeholders) ---
class WebAds implements IAdService {
    init() { console.log("Web Ads Initialized"); }
    showBanner() { console.log("Show Web Banner"); }
    hideBanner() { console.log("Hide Web Banner"); }
    async showInterstitial() { 
        console.log("Show Web Interstitial"); 
        alert("This is a simulated Interstitial Ad.");
    }
    async showRewarded() { 
        console.log("Show Web Rewarded Video");
        return confirm("Watch video for rewards? (Simulated)");
    }
}

// --- WEB IAP (Stripe / Mock) ---
class WebIAP implements IIAPService {
    async getProducts(ids: string[]): Promise<Product[]> {
        return ids.map(id => ({
            productId: id,
            title: "Test Item",
            description: "A test item for web",
            price: "$0.99",
            currencyCode: "USD"
        }));
    }
    async purchase(productId: string) {
        console.log(`Purchased ${productId} on Web`);
        return { success: true, transactionId: `web_tx_${Date.now()}` };
    }
    async restorePurchases() {}
}

// --- WEB SOCIAL ---
class WebSocial implements ISocialService {
    async share(title: string) {
        if (navigator.share) {
            navigator.share({ title, url: window.location.href });
        } else {
            prompt("Copy this link to share:", window.location.href);
        }
    }
    async inviteFriends() { alert("Invite link copied to clipboard!"); }
    async getFriendList() { return getFriends(); }
}

export const WebAdapter: IPlatformAdapter = {
    id: 'WEB',
    auth: new WebAuth(),
    ads: new WebAds(),
    iap: new WebIAP(),
    social: new WebSocial(),
    initialize: async () => {
        // Any web-specific init (e.g. loading Analytics)
        console.log("Web Platform Adapter Initialized");
    }
};
