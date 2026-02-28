import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/apiService';

interface CacheEntry {
    data: any;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCachedFetch = (endpoint: string, ttl: number = DEFAULT_TTL) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const fetchData = async () => {
            const now = Date.now();
            const cachedItem = cache.get(endpoint);

            if (cachedItem && (now - cachedItem.timestamp) < ttl) {
                setData(cachedItem.data);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const result = await api.fetch(endpoint);
                if (isMounted.current) {
                    cache.set(endpoint, { data: result, timestamp: now });
                    setData(result);
                    setError(null);
                }
            } catch (err) {
                if (isMounted.current) {
                    setError(err);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [endpoint, ttl]);

    const refetch = async () => {
        const now = Date.now();
        setLoading(true);
        try {
            const result = await api.fetch(endpoint);
            cache.set(endpoint, { data: result, timestamp: now });
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch };
};
