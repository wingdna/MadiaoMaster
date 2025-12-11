
import { IPlatformAdapter } from '../types/platform';
import { WebAdapter } from './platforms/webAdapter';
import { WeChatAdapter } from './platforms/wechatAdapter';
// import { FacebookAdapter } from './platforms/facebookAdapter'; // Import when needed

class PlatformService {
    private adapter: IPlatformAdapter;

    constructor() {
        // DETECT ENVIRONMENT AUTOMATICALLY
        // This is where you switch logic based on build targets
        
        // @ts-ignore
        if (typeof wx !== 'undefined' && typeof wx.getSystemInfo === 'function') {
             // We are in WeChat Mini Game
             this.adapter = WeChatAdapter;
        } 
        // @ts-ignore
        else if (typeof FBInstant !== 'undefined') {
             // We are in Facebook Instant Games
             // this.adapter = FacebookAdapter;
             this.adapter = WebAdapter; // Fallback for now until FB adapter is built
        } 
        else {
             // Standard Web Browser
             this.adapter = WebAdapter;
        }
    }

    get auth() { return this.adapter.auth; }
    get ads() { return this.adapter.ads; }
    get iap() { return this.adapter.iap; }
    get social() { return this.adapter.social; }
    get id() { return this.adapter.id; }

    async init() {
        await this.adapter.initialize();
        // Global pre-checks (e.g., auto-login if session valid)
        const session = await this.auth.checkSession();
        if (session.success && session.user) {
            console.log(`[Platform] Auto-logged in as ${session.user.username} on ${this.adapter.id}`);
        }
    }
}

export const platformService = new PlatformService();
