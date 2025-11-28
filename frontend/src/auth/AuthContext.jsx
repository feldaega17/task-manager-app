// src/auth/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // { id, email, name, role }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // kalau mau, bisa fetch /me di sini
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { accessToken, user } = res.data;

            if (!accessToken || !user) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    const register = async (email, password, name) => {
        try {
            const res = await api.post('/auth/register', { email, password, name });
            const { accessToken, user } = res.data;

            if (!accessToken || !user) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        } catch (err) {
            console.error('Register error:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
