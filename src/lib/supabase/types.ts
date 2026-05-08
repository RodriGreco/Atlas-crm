export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'starter' | 'pro' | 'business' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          instagram_id: string | null
          facebook_id: string | null
          whatsapp_id: string | null
          source_channel: 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'manual' | 'api' | 'import' | null
          lead_score: number
          status: 'lead' | 'prospect' | 'customer' | 'inactive' | 'blocked'
          tags: string[]
          custom_fields: Json
          assigned_to: string | null
          last_contact_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          organization_id: string
          contact_id: string
          channel: 'whatsapp_business' | 'whatsapp_official' | 'instagram_dm' | 'facebook_messenger' | 'email' | 'internal'
          channel_ref_id: string | null
          assigned_to: string | null
          status: 'open' | 'pending' | 'resolved' | 'snoozed'
          unread_count: number
          last_message: string | null
          last_message_at: string | null
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          organization_id: string
          sender_type: 'contact' | 'agent' | 'bot' | 'system'
          sender_id: string | null
          content: string | null
          content_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'quick_reply' | 'sticker'
          media_url: string | null
          metadata: Json
          external_id: string | null
          status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
          is_deleted: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          pipeline_id: string | null
          contact_id: string
          assigned_to: string | null
          title: string
          value: number
          currency: string
          stage: string
          probability: number
          status: 'open' | 'won' | 'lost' | 'frozen'
          expected_close: string | null
          notes: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['deals']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          channel: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'sms'
          type: 'broadcast' | 'sequence' | 'triggered' | 'a_b_test'
          status: 'draft' | 'scheduled' | 'sending' | 'active' | 'paused' | 'completed' | 'cancelled'
          segment_id: string | null
          template: Json
          schedule_at: string | null
          stats: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      automations: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          trigger_type: string
          trigger_config: Json
          nodes: Json
          edges: Json
          status: 'active' | 'inactive' | 'draft' | 'error'
          run_count: number
          last_run_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['automations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['automations']['Insert']>
      }
      funnels: {
        Row: {
          id: string
          organization_id: string
          name: string
          channel: 'instagram' | 'facebook' | 'whatsapp'
          trigger_type: string | null
          trigger_config: Json
          nodes: Json
          edges: Json
          status: 'draft' | 'active' | 'paused'
          stats: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['funnels']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['funnels']['Insert']>
      }
    }
  }
}

// Tipos convenientes
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Automation = Database['public']['Tables']['automations']['Row']
export type Funnel = Database['public']['Tables']['funnels']['Row']

// Tipos estendidos com joins
export type ConversationWithContact = Conversation & {
  contacts: Pick<Contact, 'id' | 'name' | 'phone' | 'instagram_id' | 'facebook_id' | 'whatsapp_id' | 'lead_score'>
}

export type DealWithContact = Deal & {
  contacts: Pick<Contact, 'id' | 'name' | 'email'>
}
