export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean | null
          name: string
          target_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          name: string
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          name?: string
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brokers: {
        Row: {
          created_at: string
          established_in: number | null
          headquarter: string | null
          id: string
          is_visible: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          established_in?: number | null
          headquarter?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          established_in?: number | null
          headquarter?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      brokers_translations: {
        Row: {
          broker_id: string
          created_at: string
          description: string | null
          id: string
          language_code: string
          updated_at: string
        }
        Insert: {
          broker_id: string
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          updated_at?: string
        }
        Update: {
          broker_id?: string
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brokers_translations_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokers_translations_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          alt_text: string | null
          blurhash: string | null
          created_at: string
          file_size: number | null
          id: string
          mime_type: string | null
          path: string
          record_id: string
          storage_object_id: string | null
          table_name: string
          type: string | null
        }
        Insert: {
          alt_text?: string | null
          blurhash?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          path: string
          record_id: string
          storage_object_id?: string | null
          table_name: string
          type?: string | null
        }
        Update: {
          alt_text?: string | null
          blurhash?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          path?: string
          record_id?: string
          storage_object_id?: string | null
          table_name?: string
          type?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_translations: {
        Row: {
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          language_code: string
          post_id: string
          reading_time: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          language_code: string
          post_id: string
          reading_time?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          language_code?: string
          post_id?: string
          reading_time?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          created_at: string
          id: string
          price: number
          updated_at: string
        }
        Insert: {
          affiliate_link?: string | null
          created_at?: string
          id?: string
          price: number
          updated_at?: string
        }
        Update: {
          affiliate_link?: string | null
          created_at?: string
          id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      products_translations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language_code: string
          name: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language_code: string
          name: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      brokers_with_translations: {
        Row: {
          created_at: string | null
          established_in: number | null
          headquarter: string | null
          id: string | null
          is_visible: boolean | null
          name: string | null
          translations: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
      posts_with_translations: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          translations: Json | null
          type: Database["public"]["Enums"]["post_type"] | null
          updated_at: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products_with_translations: {
        Row: {
          affiliate_link: string | null
          created_at: string | null
          id: string | null
          price: number | null
          translations: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_audit_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_translated_content: {
        Args: {
          content_type: string
          content_id: string
          language_code?: string
          fallback_language?: string
        }
        Returns: Json
      }
      has_translation: {
        Args: {
          content_type: string
          content_id: string
          language_code: string
        }
        Returns: boolean
      }
      increment_post_views: {
        Args: { post_id: number }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      post_status: "draft" | "published"
      post_type: "news" | "event" | "terms_of_use" | "privacy_policy"
      user_role: "user" | "moderator" | "admin"
      user_status: "invited" | "active" | "inactive" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      post_status: ["draft", "published"],
      post_type: ["news", "event", "terms_of_use", "privacy_policy"],
      user_role: ["user", "moderator", "admin"],
      user_status: ["invited", "active", "inactive", "suspended"],
    },
  },
} as const
