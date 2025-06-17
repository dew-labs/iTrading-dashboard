export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          title: string;
          content: string | null;
          type: 'news' | 'event';
          status: 'published' | 'draft' | 'archived';
          author: string;
          created_at: string;
          updated_at: string;
          views: number;
          featured_image: string | null;
          excerpt: string | null;
          tags: string[] | null;
          event_date: string | null;
          event_location: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          content?: string | null;
          type: 'news' | 'event';
          status?: 'published' | 'draft' | 'archived';
          author: string;
          created_at?: string;
          updated_at?: string;
          views?: number;
          featured_image?: string | null;
          excerpt?: string | null;
          tags?: string[] | null;
          event_date?: string | null;
          event_location?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string | null;
          type?: 'news' | 'event';
          status?: 'published' | 'draft' | 'archived';
          author?: string;
          created_at?: string;
          updated_at?: string;
          views?: number;
          featured_image?: string | null;
          excerpt?: string | null;
          tags?: string[] | null;
          event_date?: string | null;
          event_location?: string | null;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          sku: string;
          category: string;
          status: 'active' | 'inactive' | 'out-of-stock';
          created_at: string;
          updated_at: string;
          featured_image: string | null;
          images: string[] | null;
          weight: number | null;
          dimensions: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          price: number;
          stock: number;
          sku: string;
          category: string;
          status?: 'active' | 'inactive' | 'out-of-stock';
          created_at?: string;
          updated_at?: string;
          featured_image?: string | null;
          images?: string[] | null;
          weight?: number | null;
          dimensions?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          sku?: string;
          category?: string;
          status?: 'active' | 'inactive' | 'out-of-stock';
          created_at?: string;
          updated_at?: string;
          featured_image?: string | null;
          images?: string[] | null;
          weight?: number | null;
          dimensions?: string | null;
        };
      };
      banners: {
        Row: {
          id: number;
          title: string;
          description: string | null;
          image_url: string;
          link_url: string | null;
          placement: 'header' | 'sidebar' | 'footer' | 'popup';
          status: 'active' | 'inactive' | 'scheduled';
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
          clicks: number;
          impressions: number;
          priority: number;
        };
        Insert: {
          id?: number;
          title: string;
          description?: string | null;
          image_url: string;
          link_url?: string | null;
          placement: 'header' | 'sidebar' | 'footer' | 'popup';
          status?: 'active' | 'inactive' | 'scheduled';
          start_date: string;
          end_date: string;
          created_at?: string;
          updated_at?: string;
          clicks?: number;
          impressions?: number;
          priority?: number;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string | null;
          image_url?: string;
          link_url?: string | null;
          placement?: 'header' | 'sidebar' | 'footer' | 'popup';
          status?: 'active' | 'inactive' | 'scheduled';
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
          clicks?: number;
          impressions?: number;
          priority?: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'editor' | 'viewer';
          status: 'active' | 'inactive' | 'pending';
          department: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'editor' | 'viewer';
          status?: 'active' | 'inactive' | 'pending';
          department?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'editor' | 'viewer';
          status?: 'active' | 'inactive' | 'pending';
          department?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
    };
  };
}

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type Banner = Database['public']['Tables']['banners']['Row'];
export type BannerInsert = Database['public']['Tables']['banners']['Insert'];
export type BannerUpdate = Database['public']['Tables']['banners']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
