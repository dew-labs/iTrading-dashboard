export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          title: string;
          content: string | null;
          type: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content?: string | null;
          type: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string | null;
          type?: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          published_at?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          subscription: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          price: number;
          subscription?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          subscription?: boolean;
          created_at?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          target_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          language_preference: string | null;
        };
        Insert: {
          id: string;
          language_preference?: string | null;
        };
        Update: {
          id?: string;
          language_preference?: string | null;
        };
      };
      images: {
        Row: {
          id: number;
          table_name: string;
          record_id: string;
          image_url: string;
          storage_object_id: string | null;
          alt_text: string | null;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          table_name: string;
          record_id: string;
          image_url: string;
          storage_object_id?: string | null;
          alt_text?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          table_name?: string;
          record_id?: string;
          image_url?: string;
          storage_object_id?: string | null;
          alt_text?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          title: string;
          description: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      user_notifications: {
        Row: {
          id: number;
          user_id: string;
          notification_id: number;
          is_read: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          notification_id: number;
          is_read?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          notification_id?: number;
          is_read?: boolean | null;
          created_at?: string;
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

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type Image = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type ImageUpdate = Database['public']['Tables']['images']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type UserNotification = Database['public']['Tables']['user_notifications']['Row'];
export type UserNotificationInsert = Database['public']['Tables']['user_notifications']['Insert'];
export type UserNotificationUpdate = Database['public']['Tables']['user_notifications']['Update'];

// Auth user type from Supabase
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
  created_at: string;
  updated_at: string;
  aud: string;
  role?: string;
}
