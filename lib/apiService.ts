
import { API_URL, WIKI_STRUCTURE } from '../constants';

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public data?: unknown;

  constructor(message: string, status: number, opts?: { code?: string; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = opts?.code;
    this.data = opts?.data;
  }
}

class ApiService {
  private isDemoMode = false;

  constructor() {
    this.checkConnection();
  }

  public async checkConnection() {
    try {
      const res = await fetch(`${API_URL}/status`, { cache: 'no-store', credentials: 'include' });
      // If we get a 200 OK but it's HTML (index.html), we are not connected to the API
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        this.isDemoMode = false;
        return true;
      }
      this.isDemoMode = true;
      return false;
    } catch (e) {
      this.isDemoMode = true;
      return false;
    }
  }

  getMode() {
    return this.isDemoMode ? 'demo' : 'live';
  }

  private getLocal(key: string) {
    const data = localStorage.getItem(`heartopia_${key}`);
    return data ? JSON.parse(data) : null;
  }

  private setLocal(key: string, data: any) {
    localStorage.setItem(`heartopia_${key}`, JSON.stringify(data));
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    if (this.isDemoMode) {
      return this.mockFetch(endpoint, options);
    }

    const timeoutMs = 10_000;
    const maxRetries = 1;

    const doFetch = async (attempt: number) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(fullUrl, {
          ...options,
          credentials: 'include',
          signal: controller.signal
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const data = isJson ? await response.json().catch(() => null) : null;

        if (!response.ok) {
          const message = (data && typeof data === 'object' && (data as any).error) ? (data as any).error : response.statusText;
          throw new ApiError(message || 'Erreur API', response.status, { data });
        }

        if (!isJson) {
          throw new ApiError(`Invalid content-type: ${contentType}. Expected JSON.`, 502);
        }

        return data;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (attempt < maxRetries) {
          return doFetch(attempt + 1);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      return await doFetch(0);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
          window.dispatchEvent(new CustomEvent('heartopia:unauthorized', { detail: { endpoint, status: error.status } }));
        }
        throw error;
      }

      console.warn(`API error on ${endpoint}, switching to demo mode for this session.`, error);
      this.isDemoMode = true;
      return this.mockFetch(endpoint, options);
    }
  }

  private async mockFetch(endpoint: string, options: RequestInit) {
    // Simple mock logic for demonstration purposes
    if (endpoint.includes('/twitch/streams')) {
        return [
            {
                id: '12345',
                user_name: 'HeartopiaFR_Officiel',
                title: 'Découverte de la nouvelle mise à jour ! 🏡',
                viewer_count: 342,
                thumbnail_url: 'https://static-cdn.jtvnw.net/ttv-boxart/2137604629_IGDB-285x380.jpg', // Placeholder image
                profile_image_url: 'https://i.ibb.co/kgjnV9QN/Generated-Image-January-10-2026-11-31-PM.png',
                type: 'live'
            },
            {
                id: '67890',
                user_name: 'ChillBuilder',
                title: 'On décore la maison de A à Z 🎨 | !commandes',
                viewer_count: 89,
                thumbnail_url: 'https://website.xdcdn.net/poster/133737826/home/fr/MLBEsJcR.jpg',
                profile_image_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
                type: 'live'
            },
            {
                id: '11223',
                user_name: 'PêcheMaster',
                title: 'Chasse aux poissons rares 🎣',
                viewer_count: 45,
                thumbnail_url: 'https://website.xdcdn.net/poster/133737826/home/s1/MEj0dry9.jpg',
                profile_image_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
                type: 'live'
            }
        ];
    }
    if (endpoint.includes('/wiki/structure')) {
      return this.getLocal('wiki_structure') || WIKI_STRUCTURE;
    }
    if (endpoint.includes('/academy')) {
      return this.getLocal('academy') || [];
    }
    if (endpoint.includes('/guides')) {
      return this.getLocal('guides') || [];
    }
    if (endpoint.includes('/team')) {
      return this.getLocal('team') || [];
    }
    if (endpoint.includes('/news') || endpoint.includes('/announcements')) {
      return [
        { 
          id: 1, 
          title: "Ouverture du Wiki !", 
          content: "Bienvenue sur la version 1.0 du Wiki Heartopia France. N'hésitez pas à contribuer !", 
          tag: "Info", 
          created_at: new Date().toISOString() 
        }
      ];
    }
    if (endpoint.includes('/admin/stats')) {
      return {
        pages: (this.getLocal('wiki_pages') || []).length,
        categories: (this.getLocal('wiki_structure') || WIKI_STRUCTURE).length,
        team: (this.getLocal('team') || []).length,
        totalVisits: 1337,
        uniqueVisitors: 420,
        todayVisits: 12,
        newUniqueToday: 5, // Mock value
        academyVideos: 5,
        comments: 3
      };
    }
    if (endpoint.includes('/admin/analytics')) {
        return {
            pages: [
                { page_path: '/', views: 150 },
                { page_path: '/wiki', views: 85 },
                { page_path: '/wiki/fr/guide-debutant', views: 42 },
                { page_path: '/codes', views: 35 }
            ],
            dailyUnique: [
                { date: new Date().toISOString(), visitors: 45 },
                { date: new Date(Date.now() - 86400000).toISOString(), visitors: 30 },
                { date: new Date(Date.now() - 172800000).toISOString(), visitors: 50 },
            ],
            actions: [],
            browsers: [
                { browser: 'Chrome', count: 120 },
                { browser: 'Firefox', count: 40 },
                { browser: 'Safari', count: 30 }
            ]
        };
    }
    if (endpoint.includes('/admin/comments')) {
      return [
        {
          id: 1,
          section_id: 1,
          section_title: 'Exemple Section',
          username: 'DemoUser',
          avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
          content: 'Ceci est un commentaire de démonstration (Mode Hors Ligne).',
          created_at: new Date().toISOString()
        }
      ];
    }

    // Handle generic POST/PUT/DELETE locally
    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
      console.log(`[Demo Mode] Simulated ${options.method} on ${endpoint}`);
      return { id: Math.floor(Math.random() * 1000), success: true };
    }

    return [];
  }
}

export const api = new ApiService();
