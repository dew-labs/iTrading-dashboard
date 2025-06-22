export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: number;
          title: string;
          content: string | null;
          type: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          status: 'draft' | 'published';
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content?: string | null;
          type: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          status?: 'draft' | 'published';
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string | null;
          type?: 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
          status?: 'draft' | 'published';
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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'user' | 'admin' | 'super_admin';
          status: 'invited' | 'active' | 'inactive' | 'suspended';
          phone: string | null;
          avatar_url: string | null;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'user' | 'admin' | 'super_admin';
          status?: 'invited' | 'active' | 'inactive' | 'suspended';
          phone?: string | null;
          avatar_url?: string | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'user' | 'admin' | 'super_admin';
          status?: 'invited' | 'active' | 'inactive' | 'suspended';
          phone?: string | null;
          avatar_url?: string | null;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_permissions: {
        Row: {
          id: number;
          user_id: string;
          resource: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          resource: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          resource?: string;
          action?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          id: number;
          role: 'user' | 'admin' | 'super_admin';
          resource: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          role: 'user' | 'admin' | 'super_admin';
          resource: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          role?: 'user' | 'admin' | 'super_admin';
          resource?: string;
          action?: string;
          created_at?: string;
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
      brokers: {
        Row: {
          id: number;
          established_at: string | null;
          headquarter: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          established_at?: string | null;
          headquarter?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          established_at?: string | null;
          headquarter?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
