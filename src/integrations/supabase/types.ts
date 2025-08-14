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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          parent_contact_id: string | null
          phone: string | null
          profession: string | null
          relationship_degree: number
          services: string[]
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          parent_contact_id?: string | null
          phone?: string | null
          profession?: string | null
          relationship_degree?: number
          services?: string[]
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          parent_contact_id?: string | null
          phone?: string | null
          profession?: string | null
          relationship_degree?: number
          services?: string[]
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_parent_contact_id_fkey"
            columns: ["parent_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_chains: {
        Row: {
          created_at: string
          id: string
          max_uses: number
          remaining_uses: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_uses: number
          remaining_uses: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_uses?: number
          remaining_uses?: number
          status?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          created_at: string
          created_by_user_id: string
          id: string
          limit_count: number
          name: string
          status: string
          token: string
          updated_at: string
          used_count: number
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          id?: string
          limit_count?: number
          name?: string
          status?: string
          token: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          id?: string
          limit_count?: number
          name?: string
          status?: string
          token?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      invite_members: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          invite_link_id: string
          inviter_user_id: string
          member_email: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          invite_link_id: string
          inviter_user_id: string
          member_email: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          invite_link_id?: string
          inviter_user_id?: string
          member_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_members_invite_link_id_fkey"
            columns: ["invite_link_id"]
            isOneToOne: false
            referencedRelation: "invite_links"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          inviter_contact_id: string | null
          inviter_email: string | null
          inviter_first_name: string | null
          inviter_last_name: string | null
          max_uses: number
          owner_user_id: string
          parent_contact_id: string | null
          status: string
          token: string
          uses_count: number
        }
        Insert: {
          chain_id: string
          created_at?: string
          id?: string
          inviter_contact_id?: string | null
          inviter_email?: string | null
          inviter_first_name?: string | null
          inviter_last_name?: string | null
          max_uses?: number
          owner_user_id: string
          parent_contact_id?: string | null
          status?: string
          token: string
          uses_count?: number
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          inviter_contact_id?: string | null
          inviter_email?: string | null
          inviter_first_name?: string | null
          inviter_last_name?: string | null
          max_uses?: number
          owner_user_id?: string
          parent_contact_id?: string | null
          status?: string
          token?: string
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "invites_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "invite_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_inviter_contact_id_fkey"
            columns: ["inviter_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_parent_contact_id_fkey"
            columns: ["parent_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite_and_add_contact: {
        Args: { p_token: string; p_contact: Json }
        Returns: {
          contact_id: string
          remaining_uses: number
          chain_status: string
        }[]
      }
      add_member_via_invite_link: {
        Args: {
          p_token: string
          p_inviter_user_id: string
          p_member_email: string
          p_contact_data: Json
        }
        Returns: {
          success: boolean
          contact_id: string
          remaining_slots: number
          error_message: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
