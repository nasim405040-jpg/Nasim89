import {
  Article,
  Category,
  BreakingNews,
  Advertisement,
  Author,
  User,
  Comment,
  HomepageSectionConfig,
  SiteSettings,
  MediaItem,
  AnalyticsSummary,
  SystemLog,
} from '../types.ts';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Articles
  getArticles: (params?: {
    categorySlug?: string;
    categoryId?: string;
    status?: string;
    tag?: string;
    authorId?: string;
    search?: string;
    featured?: boolean;
    breaking?: boolean;
    limit?: number;
    page?: number;
    all?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.set(k, String(v));
        }
      });
    }
    return fetchJSON<{ data: Article[]; total: number; page?: number; limit?: number; totalPages?: number }>(
      `/articles?${query.toString()}`
    );
  },

  getArticle: (slugOrId: string) => {
    return fetchJSON<{ article: Article; related: Article[] }>(`/articles/${encodeURIComponent(slugOrId)}`);
  },

  createArticle: (data: Partial<Article>) => {
    return fetchJSON<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateArticle: (id: string, data: Partial<Article>) => {
    return fetchJSON<Article>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteArticle: (id: string) => {
    return fetchJSON<{ success: boolean }>(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  bulkActionArticles: (ids: string[], action: string, extraParam?: string) => {
    return fetchJSON<{ success: boolean; affected: number }>('/articles/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action, extraParam }),
    });
  },

  // Categories
  getCategories: () => fetchJSON<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) =>
    fetchJSON<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) =>
    fetchJSON<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    fetchJSON<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Breaking News
  getBreakingNews: (all = false) => fetchJSON<BreakingNews[]>(`/breaking-news?all=${all}`),
  createBreakingNews: (data: Partial<BreakingNews>) =>
    fetchJSON<BreakingNews>('/breaking-news', { method: 'POST', body: JSON.stringify(data) }),
  updateBreakingNews: (id: string, data: Partial<BreakingNews>) =>
    fetchJSON<BreakingNews>(`/breaking-news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBreakingNews: (id: string) =>
    fetchJSON<{ success: boolean }>(`/breaking-news/${id}`, { method: 'DELETE' }),

  // Ads
  getAds: (activeOnly = false) => fetchJSON<Advertisement[]>(`/ads?active=${activeOnly}`),
  createAd: (data: Partial<Advertisement>) =>
    fetchJSON<Advertisement>('/ads', { method: 'POST', body: JSON.stringify(data) }),
  updateAd: (id: string, data: Partial<Advertisement>) =>
    fetchJSON<Advertisement>(`/ads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAd: (id: string) => fetchJSON<{ success: boolean }>(`/ads/${id}`, { method: 'DELETE' }),

  // Authors
  getAuthors: () => fetchJSON<Author[]>('/authors'),
  getAuthor: (slug: string) => fetchJSON<{ author: Author; articles: Article[] }>(`/authors/${slug}`),
  createAuthor: (data: Partial<Author>) =>
    fetchJSON<Author>('/authors', { method: 'POST', body: JSON.stringify(data) }),
  updateAuthor: (id: string, data: Partial<Author>) =>
    fetchJSON<Author>(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAuthor: (id: string) => fetchJSON<{ success: boolean }>(`/authors/${id}`, { method: 'DELETE' }),

  // Users & Auth
  getUsers: () => fetchJSON<User[]>('/users'),
  login: (email: string, password?: string) =>
    fetchJSON<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Audience Reach & Distribution
  broadcastPush: (payload: { articleId?: string; title: string; excerpt?: string; url?: string; image?: string }) =>
    fetchJSON<{ success: boolean; deliveredCount: number; timestamp: string; message: string }>('/audience/broadcast-push', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  broadcastNewsletter: (payload: { articleId?: string; subject: string; targetAudience?: string }) =>
    fetchJSON<{ success: boolean; sentCount: number; openRateEstimated: string; message: string }>('/audience/newsletter-broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Comments
  getComments: (articleId?: string) => fetchJSON<Comment[]>(`/comments${articleId ? `?articleId=${articleId}` : ''}`),
  createComment: (data: Partial<Comment>) =>
    fetchJSON<Comment>('/comments', { method: 'POST', body: JSON.stringify(data) }),
  updateCommentStatus: (id: string, status: 'approved' | 'pending' | 'spam') =>
    fetchJSON<Comment>(`/comments/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteComment: (id: string) => fetchJSON<{ success: boolean }>(`/comments/${id}`, { method: 'DELETE' }),
  likeComment: (id: string) => fetchJSON<Comment>(`/comments/${id}/like`, { method: 'POST' }),

  // Media
  getMedia: () => fetchJSON<MediaItem[]>('/media'),
  addMedia: (data: Partial<MediaItem>) =>
    fetchJSON<MediaItem>('/media', { method: 'POST', body: JSON.stringify(data) }),
  createMedia: (data: Partial<MediaItem>) =>
    fetchJSON<MediaItem>('/media', { method: 'POST', body: JSON.stringify(data) }),
  deleteMedia: (id: string) => fetchJSON<{ success: boolean }>(`/media/${id}`, { method: 'DELETE' }),

  // Homepage Config
  getHomepageSections: () => fetchJSON<HomepageSectionConfig[]>('/homepage-config'),
  updateHomepageSections: (sections: HomepageSectionConfig[]) =>
    fetchJSON<HomepageSectionConfig[]>('/homepage-config', { method: 'PUT', body: JSON.stringify(sections) }),

  // Settings
  getSettings: () => fetchJSON<SiteSettings>('/settings'),
  updateSettings: (data: Partial<SiteSettings>) =>
    fetchJSON<SiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Analytics & Logs
  getAnalytics: () => fetchJSON<AnalyticsSummary>('/analytics'),
  getLogs: () => fetchJSON<SystemLog[]>('/logs'),

  // Import / Export / Reset
  resetData: () => fetchJSON<{ success: boolean; message: string }>('/reset-data', { method: 'POST' }),
  resetDefaults: () => fetchJSON<{ success: boolean; message: string }>('/reset-data', { method: 'POST' }),
  importData: (data: any) => fetchJSON<{ success: boolean }>('/import', { method: 'POST', body: JSON.stringify(data) }),
  importBackup: (data: any) => fetchJSON<{ success: boolean }>('/import', { method: 'POST', body: JSON.stringify(data) }),
  exportBackup: () => fetchJSON<{ success: boolean; database: any }>('/export'),

  // AI Assistant
  suggestHeadline: (text: string, topic?: string) =>
    fetchJSON<{ suggestions: string[] }>('/ai/suggest-headline', {
      method: 'POST',
      body: JSON.stringify({ text, topic }),
    }),
  generateSummary: (title: string, content: string) =>
    fetchJSON<{ summary: string }>('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),
};
