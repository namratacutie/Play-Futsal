// Authentication Context for managing user state
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../firebase';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { ref, set, onDisconnect, onValue, serverTimestamp } from 'firebase/database';

const AuthContext = createContext();

// Allowed phone numbers and their player mappings
const ALLOWED_USERS = {
    '+9779742246521': { name: 'Suprem', gender: 'male', avatar: '👨' },
    '+9779841001742': { name: 'Nammu', gender: 'female', avatar: '👩' },
    // Also allow without country code
    '9742246521': { name: 'Suprem', gender: 'male', avatar: '👨' },
    '9841001742': { name: 'Nammu', gender: 'female', avatar: '👩' }
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
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const phoneNumber = firebaseUser.phoneNumber;
                const normalizedPhone = phoneNumber?.replace('+977', '');
                const player = ALLOWED_USERS[phoneNumber] || ALLOWED_USERS[normalizedPhone];

                if (player) {
                    setUser(firebaseUser);
                    setPlayerInfo(player);
                    // Set presence in database
                    updatePresence(player.name, true);
                } else {
                    // Not an allowed user
                    signOut(auth);
                    setError('This phone number is not authorized to play.');
                }
            } else {
                setUser(null);
                setPlayerInfo(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Update presence in realtime database
    const updatePresence = async (playerName, isOnline) => {
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
    };

    // Initialize reCAPTCHA verifier
    const setupRecaptcha = (buttonId) => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved');
                }
            });
        }
        return window.recaptchaVerifier;
    };

    // Send OTP to phone number
    const sendOTP = async (phoneNumber) => {
        setError(null);

        // Normalize phone number
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (!formattedPhone.startsWith('977')) {
            formattedPhone = '977' + formattedPhone;
        }
        formattedPhone = '+' + formattedPhone;

        // Check if phone is allowed
        const normalizedCheck = formattedPhone.replace('+977', '');
        if (!ALLOWED_USERS[formattedPhone] && !ALLOWED_USERS[normalizedCheck]) {
            setError('💔 Sorry, only Suprem and Nammu can play this game!');
            return false;
        }

        try {
            const recaptchaVerifier = setupRecaptcha('recaptcha-container');
            const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
            setConfirmationResult(result);
            return true;
        } catch (err) {
            console.error('OTP send error:', err);
            setError('Failed to send OTP. Please try again.');
            // Reset reCAPTCHA on error
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            return false;
        }
    };

    // Verify OTP
    const verifyOTP = async (otp) => {
        setError(null);

        if (!confirmationResult) {
            setError('Please request OTP first.');
            return false;
        }

        try {
            await confirmationResult.confirm(otp);
            return true;
        } catch (err) {
            console.error('OTP verification error:', err);
            setError('Invalid OTP. Please try again.');
            return false;
        }
    };

    // Logout
    const logout = async () => {
        if (playerInfo) {
            await updatePresence(playerInfo.name, false);
        }
        await signOut(auth);
    };

    const value = {
        user,
        playerInfo,
        loading,
        error,
        sendOTP,
        verifyOTP,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
