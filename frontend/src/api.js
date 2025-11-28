// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: false, // kalau nanti pakai cookie, bisa true
});

// interceptor untuk kasih Authorization header otomatis
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
