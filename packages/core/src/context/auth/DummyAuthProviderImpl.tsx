// packages/core/src/context/auth/DummyAuthProviderImpl.tsx

import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthUser } from '../../types/Auth';

export const DummyAuthProviderImpl = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fakeUser: AuthUser = {
            uid: 'dummy-uid',
            email: 'dummy@dev.local',
            name: 'Dummy Developer',
            providerId: 'dummy',
        };

        setUser(fakeUser);
        setLoading(false);
    }, []);

    const login = async () => {
        console.log('[DummyAuth] login triggered');
    };

    const logout = async () => {
        console.log('[DummyAuth] logout triggered');
    };

    const getToken = async () => {
        return 'dummy-token';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
