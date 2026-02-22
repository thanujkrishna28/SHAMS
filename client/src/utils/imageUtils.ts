import api from '../api/axios';

/**
 * Constructs a full image URL from a backend path.
 * Handles absolute URLs, relative paths, and provides a default avatar fallback.
 * @param path The image path from the database
 * @param name Optional name for the default avatar
 * @returns A full URL string
 */
export const getImageUrl = (path?: string, name?: string) => {
    if (!path) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&size=256&bold=true`;
    }

    if (path.startsWith('http')) {
        return path;
    }

    // Construct base URL from axios instance or fallback
    const baseUrl = api.defaults.baseURL?.replace('/api', '') || `http://${window.location.hostname}:5000`;

    // Ensure correct slashing
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};
