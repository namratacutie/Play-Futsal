// Authentication Context - Password Based (No Firebase Billing Required)
import { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, onDisconnect, onValue, serverTimestamp } from 'firebase/database';

const AuthContext = createContext();

// Allowed phone numbers and their player mappings
const ALLOWED_USERS = {
    '9742246521': { name: 'Suprem', gender: 'male', avatar: '👨' },
    '9841001742': { name: 'Nammu', gender: 'female', avatar: '👩' }
};

// Storage keys
const STORAGE_KEYS = {
    PASSWORDS: 'playfutsal_passwords',
    CURRENT_USER: 'playfutsal_current_user'
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [playerInfo, setPlayerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                const player = ALLOWED_USERS[userData.phone];
                if (player) {
                    setUser(userData);
                    setPlayerInfo(player);
                    updatePresence(player.name, true);
                }
            } catch (e) {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            }
        }
        setLoading(false);
    }, []);

    // Get saved passwords
    const getSavedPasswords = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    };

    // Save password
    const savePassword = (phone, password) => {
        const passwords = getSavedPasswords();
        passwords[phone] = password;
        localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    };

    // Check if user has set password
    const hasPassword = (phone) => {
        const passwords = getSavedPasswords();
        return !!passwords[phone];
    };

    // Verify password
    const verifyPassword = (phone, password) => {
        const passwords = getSavedPasswords();
        return passwords[phone] === password;
    };

    // Update presence in realtime database
    const updatePresence = async (playerName, isOnline) => {
        try {
            const presenceRef = ref(database, `presence/${playerName}`);

            if (isOnline) {
                await set(presenceRef, {
                    online: true,
                    lastSeen: serverTimestamp()
                });

                // Set up disconnect handler
                onDisconnect(presenceRef).set({
                    online: false,
                    lastSeen: serverTimestamp()
                });
            } else {
                await set(presenceRef, {
                    online: false,
                    lastSeen: serverTimestamp()
                });
            }
        } catch (e) {
            console.log('Presence update error (Firebase may not be configured):', e.message);
        }
    };

    // Check if phone is allowed
    const isAllowedPhone = (phone) => {
        const normalized = phone.replace(/\D/g, '');
        return !!ALLOWED_USERS[normalized];
    };

    // Login with password
    const login = async (phone, password) => {
        setError(null);
        const normalized = phone.replace(/\D/g, '');

        // Check if allowed
        if (!isAllowedPhone(normalized)) {
            setError('💔 Sorry, only Suprem and Nammu can play this game!');
            return { success: false, needsSetup: false };
        }

        // Check if needs to set password (first time)
        if (!hasPassword(normalized)) {
            return { success: false, needsSetup: true };
        }

        // Verify password
        if (!verifyPassword(normalized, password)) {
            setError('❌ Wrong password! Try again.');
            return { success: false, needsSetup: false };
        }

        // Success!
        const player = ALLOWED_USERS[normalized];
        const userData = { phone: normalized, name: player.name };

        setUser(userData);
        setPlayerInfo(player);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));

        // Update presence
        updatePresence(player.name, true);

        return { success: true, needsSetup: false };
    };

    // Set up password (first time)
    const setupPassword = async (phone, password) => {
        setError(null);
        const normalized = phone.replace(/\D/g, '');

        if (!isAllowedPhone(normalized)) {
            setError('💔 Sorry, only Suprem and Nammu can play this game!');
            return false;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters!');
            return false;
        }

        // Save password
        savePassword(normalized, password);

        // Auto login
        const player = ALLOWED_USERS[normalized];
        const userData = { phone: normalized, name: player.name };

        setUser(userData);
        setPlayerInfo(player);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));

        // Update presence
        updatePresence(player.name, true);

        return true;
    };

    // Logout
    const logout = async () => {
        if (playerInfo) {
            await updatePresence(playerInfo.name, false);
        }
        setUser(null);
        setPlayerInfo(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    };

    const value = {
        user,
        playerInfo,
        loading,
        error,
        login,
        setupPassword,
        logout,
        isAllowedPhone,
        hasPassword: (phone) => hasPassword(phone.replace(/\D/g, '')),
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
