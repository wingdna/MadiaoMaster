
import { UserProfile, SocialProvider } from './types';

// --- AUTHENTICATION INTERFACES ---

export interface AuthResult {
    success: boolean;
    user?: UserProfile;
    error?: string;
}

export interface IAuthService {
    // Check if user is already logged in (e.g. valid token in storage)
    checkSession(): Promise<AuthResult>;
    
    // Trigger the platform's native login flow
    login(provider?: SocialProvider): Promise<AuthResult>;
    
    // Log out
    logout(): Promise<void>;
    
    // Get list of supported login methods for this platform (e.g. WeChat only shows WeChat login)
    getSupportedProviders(): SocialProvider[];
}

// --- ADVERTISEMENT INTERFACES ---

export enum AdType {
    BANNER = 'BANNER',
    INTERSTITIAL = 'INTERSTITIAL',
    REWARDED = 'REWARDED'
}

export interface IAdService {
    // Initialize ads SDK
    init(): void;
    
    // Show a banner ad (usually bottom of screen)
    showBanner(adUnitId: string): void;
    hideBanner(): void;
    
    // Show an interstitial (popup) ad
    showInterstitial(adUnitId: string): Promise<void>;
    
    // Show a rewarded video ad. Returns true if user watched fully.
    showRewarded(adUnitId: string): Promise<boolean>;
}

// --- IN-APP PURCHASE (IAP) INTERFACES ---

export interface Product {
    productId: string;
    title: string;
    description: string;
    price: string;
    currencyCode: string;
}

export interface IIAPService {
    getProducts(productIds: string[]): Promise<Product[]>;
    purchase(productId: string): Promise<{ success: boolean; transactionId?: string }>;
    restorePurchases(): Promise<void>;
}

// --- SOCIAL SHARE INTERFACES ---

export interface ISocialService {
    share(title: string, imageUrl?: string, query?: string): Promise<void>;
    inviteFriends(): Promise<void>;
    getFriendList(): Promise<UserProfile[]>;
}

// --- MAIN ADAPTER INTERFACE ---

export interface IPlatformAdapter {
    id: 'WEB' | 'WECHAT' | 'DOUYIN' | 'FACEBOOK' | 'NATIVE';
    auth: IAuthService;
    ads: IAdService;
    iap: IIAPService;
    social: ISocialService;
    
    // Initializer
    initialize(): Promise<void>;
}
