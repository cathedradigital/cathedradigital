export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_feature_flags: {
        Row: {
          description: string | null
          feature_key: string
          id: string
          is_enabled: boolean | null
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bible_books: {
        Row: {
          abbrev: string
          canonical_type: string | null
          chapters_count: number
          created_at: string
          id: string
          name: string
          testament: string | null
          updated_at: string
        }
        Insert: {
          abbrev: string
          canonical_type?: string | null
          chapters_count: number
          created_at?: string
          id?: string
          name: string
          testament?: string | null
          updated_at?: string
        }
        Update: {
          abbrev?: string
          canonical_type?: string | null
          chapters_count?: number
          created_at?: string
          id?: string
          name?: string
          testament?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bible_chapters: {
        Row: {
          book_id: string
          created_at: string
          id: string
          number: number
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          number: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_chapters_read: {
        Row: {
          book_abbr: string
          chapter: number
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          book_abbr: string
          chapter: number
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          book_abbr?: string
          chapter?: number
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          number: number
          text: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          number: number
          text: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          number?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_verses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "bible_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      catechism_official: {
        Row: {
          content: string
          created_at: string
          paragraph: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          paragraph: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          paragraph?: number
          updated_at?: string
        }
        Relationships: []
      }
      catechism_paragraphs_read: {
        Row: {
          id: string
          paragraph: number
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          paragraph: number
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          paragraph?: number
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          description_override: string | null
          id: string
          is_locked_until_prev: boolean
          item_slug: string
          item_type: string
          metadata: Json
          order_index: number
          title_override: string | null
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          description_override?: string | null
          id?: string
          is_locked_until_prev?: boolean
          item_slug: string
          item_type: string
          metadata?: Json
          order_index?: number
          title_override?: string | null
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          description_override?: string | null
          id?: string
          is_locked_until_prev?: boolean
          item_slug?: string
          item_type?: string
          metadata?: Json
          order_index?: number
          title_override?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          category: string
          certificate_eligible: boolean
          completion_message: string | null
          cover: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_reading_time_minutes: number | null
          featured: boolean
          hero_quote: string | null
          hero_quote_author: string | null
          id: string
          learning_objectives: string[]
          metadata: Json
          nexus_refs: Json
          prerequisites: string[]
          program_slug: string | null
          recommended_for: string[]
          slug: string
          status: string
          subtitle: string | null
          title: string
          track: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          certificate_eligible?: boolean
          completion_message?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_reading_time_minutes?: number | null
          featured?: boolean
          hero_quote?: string | null
          hero_quote_author?: string | null
          id?: string
          learning_objectives?: string[]
          metadata?: Json
          nexus_refs?: Json
          prerequisites?: string[]
          program_slug?: string | null
          recommended_for?: string[]
          slug: string
          status?: string
          subtitle?: string | null
          title: string
          track?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          certificate_eligible?: boolean
          completion_message?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_reading_time_minutes?: number | null
          featured?: boolean
          hero_quote?: string | null
          hero_quote_author?: string | null
          id?: string
          learning_objectives?: string[]
          metadata?: Json
          nexus_refs?: Json
          prerequisites?: string[]
          program_slug?: string | null
          recommended_for?: string[]
          slug?: string
          status?: string
          subtitle?: string | null
          title?: string
          track?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      glossary: {
        Row: {
          bible_verses: string[] | null
          bibliography: Json | null
          catechism_references: string[] | null
          category: string | null
          created_at: string
          deep_interpretation: string | null
          definition: string
          doctrinal_weight: number
          editorial_closure: Json | null
          editorial_completeness: string
          etymology: string | null
          faq: Json | null
          fathers_refs: string[] | null
          historical_context: string | null
          id: string
          interpretation: string | null
          journey_refs: string[] | null
          language: string
          liturgy_refs: string[] | null
          logos_meditation: string | null
          magisterium_references: string[] | null
          next_steps: Json | null
          nexus_refs: Json | null
          practical_application: string | null
          prayer_refs: string[] | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          saints_refs: string[] | null
          short_definition: string | null
          slug: string | null
          term: string
          updated_at: string
          version: number
        }
        Insert: {
          bible_verses?: string[] | null
          bibliography?: Json | null
          catechism_references?: string[] | null
          category?: string | null
          created_at?: string
          deep_interpretation?: string | null
          definition: string
          doctrinal_weight?: number
          editorial_closure?: Json | null
          editorial_completeness?: string
          etymology?: string | null
          faq?: Json | null
          fathers_refs?: string[] | null
          historical_context?: string | null
          id?: string
          interpretation?: string | null
          journey_refs?: string[] | null
          language?: string
          liturgy_refs?: string[] | null
          logos_meditation?: string | null
          magisterium_references?: string[] | null
          next_steps?: Json | null
          nexus_refs?: Json | null
          practical_application?: string | null
          prayer_refs?: string[] | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          saints_refs?: string[] | null
          short_definition?: string | null
          slug?: string | null
          term: string
          updated_at?: string
          version?: number
        }
        Update: {
          bible_verses?: string[] | null
          bibliography?: Json | null
          catechism_references?: string[] | null
          category?: string | null
          created_at?: string
          deep_interpretation?: string | null
          definition?: string
          doctrinal_weight?: number
          editorial_closure?: Json | null
          editorial_completeness?: string
          etymology?: string | null
          faq?: Json | null
          fathers_refs?: string[] | null
          historical_context?: string | null
          id?: string
          interpretation?: string | null
          journey_refs?: string[] | null
          language?: string
          liturgy_refs?: string[] | null
          logos_meditation?: string | null
          magisterium_references?: string[] | null
          next_steps?: Json | null
          nexus_refs?: Json | null
          practical_application?: string | null
          prayer_refs?: string[] | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          saints_refs?: string[] | null
          short_definition?: string | null
          slug?: string | null
          term?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      journey_progress: {
        Row: {
          completed_at: string
          id: string
          journey_id: string
          reflection: string | null
          step_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          journey_id: string
          reflection?: string | null
          step_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          journey_id?: string
          reflection?: string | null
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_progress_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_steps: {
        Row: {
          content: Json
          created_at: string
          duration_minutes: number
          id: string
          is_free: boolean
          journey_id: string
          step_order: number
          step_type: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          duration_minutes?: number
          id?: string
          is_free?: boolean
          journey_id: string
          step_order?: number
          step_type?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          duration_minutes?: number
          id?: string
          is_free?: boolean
          journey_id?: string
          step_order?: number
          step_type?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_steps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          description: string
          difficulty: string
          estimated_days: number
          icon: string
          id: string
          is_active: boolean
          is_premium: boolean
          sort_order: number
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          estimated_days?: number
          icon?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          sort_order?: number
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          estimated_days?: number
          icon?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          sort_order?: number
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          source_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          source_user_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          source_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      novenas: {
        Row: {
          category: string
          closing: string
          created_at: string
          days: Json
          final_prayer: string
          is_published: boolean
          latin: string | null
          opening: string
          order_index: number
          patron: string
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          closing?: string
          created_at?: string
          days?: Json
          final_prayer?: string
          is_published?: boolean
          latin?: string | null
          opening?: string
          order_index?: number
          patron?: string
          slug: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          closing?: string
          created_at?: string
          days?: Json
          final_prayer?: string
          is_published?: boolean
          latin?: string | null
          opening?: string
          order_index?: number
          patron?: string
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_blocks: {
        Row: {
          audio_key: string | null
          content: Json
          created_at: string
          id: string
          meta: Json
          mystery_id: string | null
          order_index: number
          prayer_id: string
          repeat_count: number
          section_id: string | null
          slug: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          audio_key?: string | null
          content?: Json
          created_at?: string
          id?: string
          meta?: Json
          mystery_id?: string | null
          order_index?: number
          prayer_id: string
          repeat_count?: number
          section_id?: string | null
          slug?: string | null
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          audio_key?: string | null
          content?: Json
          created_at?: string
          id?: string
          meta?: Json
          mystery_id?: string | null
          order_index?: number
          prayer_id?: string
          repeat_count?: number
          section_id?: string | null
          slug?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_blocks_mystery_id_fkey"
            columns: ["mystery_id"]
            isOneToOne: false
            referencedRelation: "prayer_mysteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_blocks_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "prayer_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_mysteries: {
        Row: {
          created_at: string
          fruit: string | null
          gospel_ref: string | null
          gospel_text: string | null
          id: string
          image_key: string | null
          meditation: string | null
          meta: Json
          order_index: number
          section_id: string
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fruit?: string | null
          gospel_ref?: string | null
          gospel_text?: string | null
          id?: string
          image_key?: string | null
          meditation?: string | null
          meta?: Json
          order_index?: number
          section_id: string
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fruit?: string | null
          gospel_ref?: string | null
          gospel_text?: string | null
          id?: string
          image_key?: string | null
          meditation?: string | null
          meta?: Json
          order_index?: number
          section_id?: string
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_mysteries_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "prayer_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_sections: {
        Row: {
          created_at: string
          id: string
          meta: Json
          order_index: number
          prayer_id: string
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
          weekdays: number[]
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json
          order_index?: number
          prayer_id: string
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
          weekdays?: number[]
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json
          order_index?: number
          prayer_id?: string
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "prayer_sections_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_sessions: {
        Row: {
          bookmarks: Json
          completed_at: string | null
          completed_block_ids: string[]
          completed_mystery_ids: string[]
          completed_section_ids: string[]
          created_at: string
          current_block_id: string | null
          current_block_index: number
          current_block_uuid: string | null
          current_mystery_id: string | null
          current_section_id: string | null
          elapsed_seconds: number
          id: string
          prayer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarks?: Json
          completed_at?: string | null
          completed_block_ids?: string[]
          completed_mystery_ids?: string[]
          completed_section_ids?: string[]
          created_at?: string
          current_block_id?: string | null
          current_block_index?: number
          current_block_uuid?: string | null
          current_mystery_id?: string | null
          current_section_id?: string | null
          elapsed_seconds?: number
          id?: string
          prayer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarks?: Json
          completed_at?: string | null
          completed_block_ids?: string[]
          completed_mystery_ids?: string[]
          completed_section_ids?: string[]
          created_at?: string
          current_block_id?: string | null
          current_block_index?: number
          current_block_uuid?: string | null
          current_mystery_id?: string | null
          current_section_id?: string | null
          elapsed_seconds?: number
          id?: string
          prayer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_sessions_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
        ]
      }
      prayers: {
        Row: {
          category: Database["public"]["Enums"]["prayer_category"]
          content: string
          content_latin: string | null
          created_at: string
          engine_version: number
          estimated_seconds: number
          explanation: string | null
          id: string
          is_published: boolean
          kicker: string | null
          meditation: string | null
          order_index: number
          related_bible: string[]
          related_catechism: number[]
          related_glossary: string[]
          related_saints: string[]
          slug: string
          source_ref: string | null
          subtitle: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["prayer_category"]
          content: string
          content_latin?: string | null
          created_at?: string
          engine_version?: number
          estimated_seconds?: number
          explanation?: string | null
          id?: string
          is_published?: boolean
          kicker?: string | null
          meditation?: string | null
          order_index?: number
          related_bible?: string[]
          related_catechism?: number[]
          related_glossary?: string[]
          related_saints?: string[]
          slug: string
          source_ref?: string | null
          subtitle?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["prayer_category"]
          content?: string
          content_latin?: string | null
          created_at?: string
          engine_version?: number
          estimated_seconds?: number
          explanation?: string | null
          id?: string
          is_published?: boolean
          kicker?: string | null
          meditation?: string | null
          order_index?: number
          related_bible?: string[]
          related_catechism?: number[]
          related_glossary?: string[]
          related_saints?: string[]
          slug?: string
          source_ref?: string | null
          subtitle?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          is_premium: boolean
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id: string
          is_premium?: boolean
          name?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          is_premium?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_marks: {
        Row: {
          chapter: number | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          is_last_read: boolean | null
          label: string | null
          paragraph: number | null
          position: number | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          chapter?: number | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          is_last_read?: boolean | null
          label?: string | null
          paragraph?: number | null
          position?: number | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          chapter?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          is_last_read?: boolean | null
          label?: string | null
          paragraph?: number | null
          position?: number | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ritual_progress: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          progress_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          progress_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          progress_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saints: {
        Row: {
          ai_reflection: Json | null
          alternate_names: string[]
          bible_refs: Json | null
          bio: string | null
          bio_source_url: string | null
          birthplace: string | null
          born: string | null
          catechism_refs: number[] | null
          category: string | null
          church_doc_refs: Json | null
          content_hash: string | null
          conversion_story: string | null
          country: string | null
          created_at: string | null
          died: string | null
          editorial_closure: Json | null
          editorial_score: number
          feast_day: string | null
          feast_day_num: number | null
          feast_month: number | null
          full_bio: string | null
          id: string
          image: string | null
          image_attribution: string | null
          image_license: string | null
          image_source_url: string | null
          key_events: Json
          last_scraped_at: string | null
          legacy: string | null
          mission: string | null
          name: string
          patron_of: string[] | null
          prayer: string | null
          prayer_source_url: string | null
          quotes: string[] | null
          religious_order: string | null
          source_metadata: Json
          source_name: string | null
          source_url: string | null
          spirituality_summary: string | null
          status: string
          title: string | null
          updated_at: string | null
          virtues: string[] | null
          vocation: string | null
          works: Json | null
        }
        Insert: {
          ai_reflection?: Json | null
          alternate_names?: string[]
          bible_refs?: Json | null
          bio?: string | null
          bio_source_url?: string | null
          birthplace?: string | null
          born?: string | null
          catechism_refs?: number[] | null
          category?: string | null
          church_doc_refs?: Json | null
          content_hash?: string | null
          conversion_story?: string | null
          country?: string | null
          created_at?: string | null
          died?: string | null
          editorial_closure?: Json | null
          editorial_score?: number
          feast_day?: string | null
          feast_day_num?: number | null
          feast_month?: number | null
          full_bio?: string | null
          id: string
          image?: string | null
          image_attribution?: string | null
          image_license?: string | null
          image_source_url?: string | null
          key_events?: Json
          last_scraped_at?: string | null
          legacy?: string | null
          mission?: string | null
          name: string
          patron_of?: string[] | null
          prayer?: string | null
          prayer_source_url?: string | null
          quotes?: string[] | null
          religious_order?: string | null
          source_metadata?: Json
          source_name?: string | null
          source_url?: string | null
          spirituality_summary?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
          virtues?: string[] | null
          vocation?: string | null
          works?: Json | null
        }
        Update: {
          ai_reflection?: Json | null
          alternate_names?: string[]
          bible_refs?: Json | null
          bio?: string | null
          bio_source_url?: string | null
          birthplace?: string | null
          born?: string | null
          catechism_refs?: number[] | null
          category?: string | null
          church_doc_refs?: Json | null
          content_hash?: string | null
          conversion_story?: string | null
          country?: string | null
          created_at?: string | null
          died?: string | null
          editorial_closure?: Json | null
          editorial_score?: number
          feast_day?: string | null
          feast_day_num?: number | null
          feast_month?: number | null
          full_bio?: string | null
          id?: string
          image?: string | null
          image_attribution?: string | null
          image_license?: string | null
          image_source_url?: string | null
          key_events?: Json
          last_scraped_at?: string | null
          legacy?: string | null
          mission?: string | null
          name?: string
          patron_of?: string[] | null
          prayer?: string | null
          prayer_source_url?: string | null
          quotes?: string[] | null
          religious_order?: string | null
          source_metadata?: Json
          source_name?: string | null
          source_url?: string | null
          spirituality_summary?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
          virtues?: string[] | null
          vocation?: string | null
          works?: Json | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string | null
          filter_by: string | null
          id: string
          name: string
          project_id: string | null
          query: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filter_by?: string | null
          id?: string
          name: string
          project_id?: string | null
          query?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filter_by?: string | null
          id?: string
          name?: string
          project_id?: string | null
          query?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spiritual_contents: {
        Row: {
          content_text: string
          created_at: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          tags: string[] | null
          title: string
          type: string
        }
        Insert: {
          content_text: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          tags?: string[] | null
          title: string
          type: string
        }
        Update: {
          content_text?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          tags?: string[] | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      spiritual_journal: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          journey_id: string | null
          mood: string | null
          step_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          journey_id?: string | null
          mood?: string | null
          step_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          journey_id?: string | null
          mood?: string | null
          step_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiritual_journal_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spiritual_journal_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      theme_contents: {
        Row: {
          content_type: string
          created_at: string
          id: string
          reference: string
          text_content: string | null
          theme_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          id?: string
          reference: string
          text_content?: string | null
          theme_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          id?: string
          reference?: string
          text_content?: string | null
          theme_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_contents_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_history: {
        Row: {
          id: string
          image_url: string | null
          route: string
          title: string
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          route: string
          title: string
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          image_url?: string | null
          route?: string
          title?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          book_abbr: string | null
          chapter: number | null
          content_id: string
          content_type: string
          created_at: string
          highlight_color: string | null
          id: string
          note_text: string
          paragraph: number | null
          updated_at: string
          user_id: string
          verse: number | null
        }
        Insert: {
          book_abbr?: string | null
          chapter?: number | null
          content_id: string
          content_type: string
          created_at?: string
          highlight_color?: string | null
          id?: string
          note_text?: string
          paragraph?: number | null
          updated_at?: string
          user_id: string
          verse?: number | null
        }
        Update: {
          book_abbr?: string | null
          chapter?: number | null
          content_id?: string
          content_type?: string
          created_at?: string
          highlight_color?: string | null
          id?: string
          note_text?: string
          paragraph?: number | null
          updated_at?: string
          user_id?: string
          verse?: number | null
        }
        Relationships: []
      }
      user_reminder_settings: {
        Row: {
          email_enabled: boolean
          push_enabled: boolean
          reminder_frequency: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          email_enabled?: boolean
          push_enabled?: boolean
          reminder_frequency?: string
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          email_enabled?: boolean
          push_enabled?: boolean
          reminder_frequency?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "editor" | "reviewer"
      bible_import_phase:
        | "A_pentateuco"
        | "B_historicos"
        | "C_sapienciais"
        | "D_profetas"
        | "E_novo_testamento"
      bible_phase_status:
        | "pending"
        | "importing"
        | "imported"
        | "certified"
        | "rejected"
      bible_translation_pipeline_stage:
        | "draft"
        | "importing"
        | "integrity_check"
        | "editorial_review"
        | "ice"
        | "certified"
        | "primary"
        | "archived"
      content_curation_status: "stub" | "partial" | "complete"
      editorial_status_enum:
        | "draft"
        | "doctrinal_review"
        | "editorial_review"
        | "ice_pending"
        | "published"
        | "archived"
      library_kind:
        | "saint_work"
        | "patristic"
        | "doctor"
        | "classic"
        | "magisterium"
      prayer_category:
        | "fundamentais"
        | "marianas"
        | "espirito_santo"
        | "santos"
        | "antes_depois"
        | "protecao"
        | "momentos_do_dia"
        | "eucaristica"
        | "confissao_defuntos"
      saint_content_status: "stub" | "partial" | "complete"
      saint_work_access_type:
        | "internal"
        | "official_external"
        | "public_domain"
        | "licensed"
      saint_work_category:
        | "patristica"
        | "escolastica"
        | "mistica"
        | "monastica"
        | "carmelita"
        | "franciscana"
        | "dominicana"
        | "doutor"
        | "espiritualidade"
        | "apologetica"
        | "liturgica"
        | "classic"
        | "magisterio"
      saint_work_ficha_completeness: "stub" | "minimal" | "complete"
      saint_work_reading_level: "beginner" | "intermediate" | "advanced"
      saint_work_status: "draft" | "in_review" | "published" | "archived"
      search_result_type:
        | "bible"
        | "catechism"
        | "saint"
        | "patristic"
        | "magisterium"
        | "prayer"
        | "journey"
        | "glossary"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user", "editor", "reviewer"],
      bible_import_phase: [
        "A_pentateuco",
        "B_historicos",
        "C_sapienciais",
        "D_profetas",
        "E_novo_testamento",
      ],
      bible_phase_status: [
        "pending",
        "importing",
        "imported",
        "certified",
        "rejected",
      ],
      bible_translation_pipeline_stage: [
        "draft",
        "importing",
        "integrity_check",
        "editorial_review",
        "ice",
        "certified",
        "primary",
        "archived",
      ],
      content_curation_status: ["stub", "partial", "complete"],
      editorial_status_enum: [
        "draft",
        "doctrinal_review",
        "editorial_review",
        "ice_pending",
        "published",
        "archived",
      ],
      library_kind: [
        "saint_work",
        "patristic",
        "doctor",
        "classic",
        "magisterium",
      ],
      prayer_category: [
        "fundamentais",
        "marianas",
        "espirito_santo",
        "santos",
        "antes_depois",
        "protecao",
        "momentos_do_dia",
        "eucaristica",
        "confissao_defuntos",
      ],
      saint_content_status: ["stub", "partial", "complete"],
      saint_work_access_type: [
        "internal",
        "official_external",
        "public_domain",
        "licensed",
      ],
      saint_work_category: [
        "patristica",
        "escolastica",
        "mistica",
        "monastica",
        "carmelita",
        "franciscana",
        "dominicana",
        "doutor",
        "espiritualidade",
        "apologetica",
        "liturgica",
        "classic",
        "magisterio",
      ],
      saint_work_ficha_completeness: ["stub", "minimal", "complete"],
      saint_work_reading_level: ["beginner", "intermediate", "advanced"],
      saint_work_status: ["draft", "in_review", "published", "archived"],
      search_result_type: [
        "bible",
        "catechism",
        "saint",
        "patristic",
        "magisterium",
        "prayer",
        "journey",
        "glossary",
      ],
    },
  },
} as const
