
import { GameHistory, UserProfile, SocialProvider, Gender, MatchLogEntry, GazeDirection } from '../types';

// Use any for Supabase types since we're using the global UMD build
let supabase: any = null;

const STORAGE_KEY_URL = 'ma_diao_supabase_url';
const STORAGE_KEY_KEY = 'ma_diao_supabase_key';
const BUCKET_NAME = 'avatars';
const TABLE_HISTORY = 'match_logs';
const TABLE_PROFILES = 'profiles';
const TABLE_FRIENDS = 'friendships';

const MOCK_USER_KEY = 'ma_diao_mock_user';
const MOCK_PROFILE_KEY = 'ma_diao_mock_profile';
const MOCK_FRIENDS_KEY = 'ma_diao_mock_friends';

export interface AdminLogEntry {
    id: string;
    timestamp: number;
    data: MatchLogEntry;
}

// --- CULTURAL POOLS & ID MAPPING ---
// We define ID ranges for xsgames.co to approximate ethnicities.
// Range helper
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

interface CulturalPool {
    regionName: string;
    countries: string[];
    names: string[];
    titles: string[];
    // ID ranges for xsgames.co/randomusers/assets/avatars/{gender}/{id}.jpg
    // We arbitrarily partition them to create "buckets" of consistent looks.
    maleIds: number[]; 
    femaleIds: number[];
}

const CULTURAL_POOLS: Record<string, CulturalPool> = {
    EAST_ASIA: {
        regionName: 'East Asia',
        countries: ['cn', 'jp', 'kr', 'hk', 'tw', 'sg', 'vn'],
        names: [
            'Wei', 'Jie', 'Ming', 'Hao', 'Yi', 'Long', 'Chen', // CN
            'Ken', 'Ryu', 'Hiro', 'Satoshi', 'Takumi', // JP
            'Min-Ho', 'Ji-Sung', 'Soo', 'Jin' // KR
        ],
        titles: ['The Scholar', 'Master', 'Sifu', 'Ronin', 'Poet', 'Hand', 'Fox', 'Dragon'],
        // Assigning lower ID ranges to Asia (Arbitrary partitioning for consistency)
        maleIds: [...range(0, 10), ...range(60, 65)], 
        femaleIds: [...range(0, 10), ...range(60, 65)]
    },
    WESTERN: {
        regionName: 'Western',
        countries: ['us', 'gb', 'fr', 'de', 'it', 'ru', 'au', 'ca'],
        names: [
            'John', 'Arthur', 'William', 'James', 'Leo', 'Oliver', 'Harry', 
            'Alice', 'Rose', 'Clara', 'Emma', 'Sofia', 'Charlotte'
        ],
        titles: ['The Duke', 'Knight', 'Ace', 'Gambler', 'Baron', 'Duchess', 'Queen'],
        // Assigning middle ID ranges to Western
        maleIds: [...range(11, 40)],
        femaleIds: [...range(11, 40)]
    },
    GLOBAL_SOUTH: {
        regionName: 'Global South',
        countries: ['br', 'mx', 'in', 'za', 'ng', 'eg', 'th', 'ph', 'sa'],
        names: [
            'Mateo', 'Diego', 'Ravi', 'Arjun', 'Malik', 'Omar', 'Amir',
            'Luna', 'Camila', 'Priya', 'Zara', 'Nia', 'Fatima'
        ],
        titles: ['Traveler', 'Merchant', 'Guide', 'Mystic', 'Wanderer', 'Sheikh', 'Raja'],
        // Assigning remaining ID ranges
        maleIds: [...range(41, 59), ...range(66, 78)],
        femaleIds: [...range(41, 59), ...range(66, 78)]
    }
};

// --- CORE GENERATOR LOGIC ---

const generateRandomProfile = (preferredRegion?: keyof typeof CULTURAL_POOLS): UserProfile => {
    // 1. Pick Ethnicity/Region
    let regionKey = preferredRegion;
    if (!regionKey) {
        const rand = Math.random();
        // Weighted probability: 50% East Asia (Theme fit), 30% Western, 20% Global
        if (rand < 0.5) regionKey = 'EAST_ASIA'; 
        else if (rand < 0.8) regionKey = 'WESTERN';
        else regionKey = 'GLOBAL_SOUTH';
    }
    const pool = CULTURAL_POOLS[regionKey!];

    // 2. Pick Gender
    const isFemale = Math.random() > 0.5;
    const gender: Gender = isFemale ? 'FEMALE' : 'MALE';

    // 3. Pick Name & Country from the MATCHING pool
    const name = pool.names[Math.floor(Math.random() * pool.names.length)];
    const title = pool.titles[Math.floor(Math.random() * pool.titles.length)];
    const country = pool.countries[Math.floor(Math.random() * pool.countries.length)];
    
    // 4. Pick Avatar ID from the MATCHING pool's ID list
    // This ensures "John" gets a Western face and "Wei" gets an Asian face.
    const idList = isFemale ? pool.femaleIds : pool.maleIds;
    // Fallback if list empty (shouldn't happen with correct ranges)
    const photoId = idList.length > 0 ? idList[Math.floor(Math.random() * idList.length)] : Math.floor(Math.random() * 50);
    
    const genderPath = isFemale ? 'female' : 'male';
    const avatarUrl = `https://xsgames.co/randomusers/assets/avatars/${genderPath}/${photoId}.jpg`;

    // 5. Simulate Gaze Direction (For intelligent seating)
    // Most portraits look roughly center, but many have a distinct left/right bias.
    // We assign this property so the seating algorithm can use it.
    const gazeRand = Math.random();
    let gazeDirection: GazeDirection = 'CENTER';
    if (gazeRand < 0.35) gazeDirection = 'LEFT';
    else if (gazeRand < 0.7) gazeDirection = 'RIGHT';

    return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        username: `${name} ${title}`,
        gender: gender,
        age: 18 + Math.floor(Math.random() * 45),
        country: country,
        gazeDirection: gazeDirection,
        is_looking_for_match: true,
        last_active: Date.now(),
        friends: [],
        avatar_url: avatarUrl,
        location: { lat: 30 + Math.random() * 10, lng: 110 + Math.random() * 20 }
    };
};

export const MOCK_PLAYERS = Array.from({ length: 20 }).map(() => generateRandomProfile());

// --- INITIALIZATION ---

export const isCloudConfigured = (): boolean => {
    return !!supabase;
};

export const initSupabase = (url?: string, key?: string) => {
    let supabaseUrl = url || localStorage.getItem(STORAGE_KEY_URL);
    let supabaseKey = key || localStorage.getItem(STORAGE_KEY_KEY);

    if (supabaseUrl && supabaseKey) {
        try {
            const globalSupabase = (window as any).supabase;
            if (globalSupabase && globalSupabase.createClient) {
                supabase = globalSupabase.createClient(supabaseUrl, supabaseKey);
                if (url) localStorage.setItem(STORAGE_KEY_URL, url);
                if (key) localStorage.setItem(STORAGE_KEY_KEY, key);
                console.log("Cloud Service (MemFire/Supabase) initialized.");
                return true;
            }
        } catch (e) {
            console.error("Failed to init Cloud", e);
        }
    }
    return false;
};

export const getSupabaseConfig = () => {
    return {
        url: localStorage.getItem(STORAGE_KEY_URL) || '',
        key: localStorage.getItem(STORAGE_KEY_KEY) || ''
    };
};

export const clearSupabaseConfig = () => {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    supabase = null;
};

// --- AUTHENTICATION ---

export const getCurrentUser = async () => {
    if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;
    }
    const mock = localStorage.getItem(MOCK_USER_KEY);
    if (mock) return JSON.parse(mock);
    return null;
};

export const signInWithProvider = async (provider: SocialProvider) => {
    if (!supabase) return { error: "CLOUD_NOT_CONFIGURED" };
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: { redirectTo: window.location.origin }
        });
        return { data, error };
    } catch (e) {
        return { error: e };
    }
};

export const loginAsGuest = async (provider: string) => {
    const mockUser = {
        id: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        email: `${provider}_guest@jianghu.com`,
        app_metadata: { provider },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
    };
    
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));

    // Guest gets an Asian profile by default for immersion
    const gen = generateRandomProfile('EAST_ASIA');
    const mockProfile = {
        ...gen,
        username: `Guest ${gen.username.split(' ')[0]}`
    };

    const updates = {
        id: mockUser.id,
        is_looking_for_match: true,
        last_active: Date.now(),
        updated_at: new Date(),
        friends: [],
        ...mockProfile
    };
    
    localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(updates));

    return { user: mockUser, error: null };
};

export const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(MOCK_USER_KEY);
};

// --- PROFILE MANAGEMENT ---

const isGuest = (id: string) => id.startsWith('guest_');

export const upsertUserProfile = async (profile: Partial<UserProfile>) => {
    const user = await getCurrentUser();
    if (!user) return null;

    const updates = {
        id: user.id,
        username: profile.username || user.email?.split('@')[0] || 'Wanderer',
        avatar_url: profile.avatar_url,
        gender: profile.gender,
        age: profile.age,
        country: profile.country || 'cn', 
        location: profile.location, 
        is_looking_for_match: profile.is_looking_for_match,
        last_active: Date.now(),
        updated_at: new Date(),
        friends: [] 
    };

    if (isGuest(user.id)) {
        const existing = JSON.parse(localStorage.getItem(MOCK_PROFILE_KEY) || '{}');
        const final = { ...existing, ...updates, ...profile }; 
        localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(final));
        return final;
    } else if (supabase) {
        const { friends, ...profileData } = updates;
        const { error } = await supabase.from(TABLE_PROFILES).upsert(profileData);
        if (error) {
            localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(updates));
            return updates;
        }
        return updates;
    }
    return null;
};

export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
    let id = userId;
    if (!id) {
        const u = await getCurrentUser();
        if (!u) return null;
        id = u.id;
    }

    if (isGuest(id)) {
        const local = localStorage.getItem(MOCK_PROFILE_KEY);
        if (local) {
            const parsed = JSON.parse(local);
            const localFriends = JSON.parse(localStorage.getItem(MOCK_FRIENDS_KEY) || '[]');
            return { ...parsed, friends: localFriends };
        }
        return null;
    }

    if (supabase) {
        const { data, error } = await supabase
            .from(TABLE_PROFILES)
            .select('*')
            .eq('id', id)
            .single();
        if (!error && data) {
            return data as UserProfile; 
        }
    }
    const local = localStorage.getItem(MOCK_PROFILE_KEY);
    return local ? JSON.parse(local) : null;
};

// --- AVATAR UPLOAD ---

export const uploadAvatar = async (file: File): Promise<string | null> => {
    if (supabase) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `user_avatar/${fileName}`;
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
            if (!uploadError) {
                const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
                return data.publicUrl;
            }
        } catch (e) {
            console.warn("Cloud upload failed, using local URL");
        }
    }
    return URL.createObjectURL(file);
};

// --- MATCHMAKING LOGIC ---

export const findMatch = async (myProfile: UserProfile): Promise<UserProfile[]> => {
    let candidates: UserProfile[] = [];

    // 1. Try Fetch Cloud Candidates
    if (supabase) {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const { data } = await supabase
            .from(TABLE_PROFILES)
            .select('*')
            .neq('id', myProfile.id)
            .eq('is_looking_for_match', true)
            .gt('last_active', fiveMinutesAgo)
            .limit(20);
        if (data) candidates = data;
    }

    // 2. Mix in Freshly Generated Mocks
    const freshMocks = Array.from({ length: 5 }).map(() => generateRandomProfile(Math.random() > 0.3 ? 'EAST_ASIA' : undefined));
    candidates = [...candidates, ...freshMocks];

    // 3. Score & Sort
    const scored = candidates.map(c => {
        let score = 0;
        if (myProfile.gender !== 'OTHER' && c.gender !== 'OTHER' && myProfile.gender !== c.gender) score += 50;
        const ageDiff = Math.abs(myProfile.age - c.age);
        if (ageDiff <= 5) score += 20;
        return { profile: c, score };
    });

    return scored.sort((a, b) => b.score - a.score).map(s => s.profile);
};

// --- FRIENDS SYSTEM ---

export const addFriend = async (friendId: string) => {
    const user = await getCurrentUser();
    if (!user) return false;

    if (isGuest(user.id)) {
        const friends = JSON.parse(localStorage.getItem(MOCK_FRIENDS_KEY) || '[]');
        if (!friends.includes(friendId)) {
            friends.push(friendId);
            localStorage.setItem(MOCK_FRIENDS_KEY, JSON.stringify(friends));
        }
        return true;
    }

    if (supabase) {
        const { error } = await supabase.from(TABLE_FRIENDS).insert([{ user_id_1: user.id, user_id_2: friendId, status: 'accepted' }]);
        return !error;
    }
    return false;
};

export const getFriends = async (): Promise<UserProfile[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    if (isGuest(user.id)) {
        const friendIds = JSON.parse(localStorage.getItem(MOCK_FRIENDS_KEY) || '[]');
        return MOCK_PLAYERS.slice(0, friendIds.length); 
    }

    if (supabase) {
        const { data: friendships } = await supabase.from(TABLE_FRIENDS).select('*').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);
        if (friendships) {
            const ids = friendships.map((f: any) => f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1);
            const { data: friends } = await supabase.from(TABLE_PROFILES).select('*').in('id', ids);
            return friends || [];
        }
    }
    return [];
};

// --- EXISTING ADMIN & STATS ---
export const syncGameStats = async (history: GameHistory) => {
    if (supabase && history.matchLogs.length > 0) {
        supabase.from(TABLE_HISTORY).upsert({ id: history.matchLogs[0].id, timestamp: history.matchLogs[0].timestamp, data: history.matchLogs[0] }).then();
    }
};
export const fetchAllMatchLogs = async (): Promise<AdminLogEntry[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from(TABLE_HISTORY).select('*').order('timestamp', { ascending: false }).limit(50);
    return data || [];
};
export const deleteMatchLog = async (id: string): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from(TABLE_HISTORY).delete().eq('id', id);
    return !error;
};
