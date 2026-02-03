/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'super_admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'super_admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_types: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'count' | 'time'
          increment_value: number | null
          time_increment_minutes: number | null
          is_visible: boolean
          is_enabled: boolean
          display_order: number
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: 'count' | 'time'
          increment_value?: number | null
          time_increment_minutes?: number | null
          is_visible?: boolean
          is_enabled?: boolean
          display_order?: number
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: 'count' | 'time'
          increment_value?: number | null
          time_increment_minutes?: number | null
          is_visible?: boolean
          is_enabled?: boolean
          display_order?: number
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_counters: {
        Row: {
          id: string
          prayer_type_id: string
          total_count: number
          total_time_minutes: number
          unique_contributors: number
          last_updated: string
        }
        Insert: {
          id?: string
          prayer_type_id: string
          total_count?: number
          total_time_minutes?: number
          unique_contributors?: number
          last_updated?: string
        }
        Update: {
          id?: string
          prayer_type_id?: string
          total_count?: number
          total_time_minutes?: number
          unique_contributors?: number
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prayer_counters_prayer_type_id_fkey'
            columns: ['prayer_type_id']
            referencedRelation: 'prayer_types'
            referencedColumns: ['id']
          }
        ]
      }
      prayer_actions: {
        Row: {
          id: string
          prayer_type_id: string
          action_type: string
          increment_amount: number
          user_identifier: string
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prayer_type_id: string
          action_type?: string
          increment_amount?: number
          user_identifier: string
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prayer_type_id?: string
          action_type?: string
          increment_amount?: number
          user_identifier?: string
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prayer_actions_prayer_type_id_fkey'
            columns: ['prayer_type_id']
            referencedRelation: 'prayer_types'
            referencedColumns: ['id']
          }
        ]
      }
      programs: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_logs_admin_id_fkey'
            columns: ['admin_id']
            referencedRelation: 'admin_users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_prayer_statistics: {
        Args: Record<PropertyKey, never>
        Returns: any[]
      }
      count_unique_contributors: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      admin_edit_prayer_counter: {
        Args: {
          p_prayer_type_id: string
          p_new_value: number
          p_admin_note: string | null
        }
        Returns: any[]
      }
      admin_reset_prayer_counter: {
        Args: {
          p_prayer_type_id: string
          p_admin_note: string | null
        }
        Returns: void
      }
      submit_prayer_action: {
        Args: {
          p_prayer_type_id: string
          p_user_identifier: string
          p_ip_address: string
          p_user_agent: string
        }
        Returns: any
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
