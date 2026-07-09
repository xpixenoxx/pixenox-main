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
      theme_settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string | null
        }
      }
      brand_settings: {
        Row: {
          id: string
          logo_url: string | null
          company_name: string
          company_name_color: string | null
          favicon_url: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          logo_url?: string | null
          company_name: string
          company_name_color?: string | null
          favicon_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          logo_url?: string | null
          company_name?: string
          company_name_color?: string | null
          favicon_url?: string | null
          updated_at?: string | null
        }
      }
      nav_config: {
        Row: {
          id: string
          label: string
          href: string
          priority: number | null
          is_visible: boolean | null
        }
        Insert: {
          id?: string
          label: string
          href: string
          priority?: number | null
          is_visible?: boolean | null
        }
        Update: {
          id?: string
          label?: string
          href?: string
          priority?: number | null
          is_visible?: boolean | null
        }
      }
      seo_config: {
        Row: {
          id: string
          page: string
          title: string | null
          description: string | null
          og_image_url: string | null
          canonical_url: string | null
          keywords: string[] | null
        }
        Insert: {
          id?: string
          page: string
          title?: string | null
          description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          keywords?: string[] | null
        }
        Update: {
          id?: string
          page?: string
          title?: string | null
          description?: string | null
          og_image_url?: string | null
          canonical_url?: string | null
          keywords?: string[] | null
        }
      }
      hero_settings: {
        Row: {
          id: string
          headline: string
          headline_color: string | null
          subheadline: string | null
          subheadline_color: string | null
          cta_text: string | null
          cta_url: string | null
          cta_bg_color: string | null
          cta_hover_bg_color: string | null
          cta_text_color: string | null
          cta_border_radius: string | null
          bg_type: string | null
          bg_gradient_start: string | null
          bg_gradient_end: string | null
          bg_image_url: string | null
          bg_video_url: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          headline: string
          headline_color?: string | null
          subheadline?: string | null
          subheadline_color?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_bg_color?: string | null
          cta_hover_bg_color?: string | null
          cta_text_color?: string | null
          cta_border_radius?: string | null
          bg_type?: string | null
          bg_gradient_start?: string | null
          bg_gradient_end?: string | null
          bg_image_url?: string | null
          bg_video_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          headline?: string
          headline_color?: string | null
          subheadline?: string | null
          subheadline_color?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_bg_color?: string | null
          cta_hover_bg_color?: string | null
          cta_text_color?: string | null
          cta_border_radius?: string | null
          bg_type?: string | null
          bg_gradient_start?: string | null
          bg_gradient_end?: string | null
          bg_image_url?: string | null
          bg_video_url?: string | null
          updated_at?: string | null
        }
      }
      services_layout: {
        Row: {
          id: string
          layout_type: string | null
          cards_per_row: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          layout_type?: string | null
          cards_per_row?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          layout_type?: string | null
          cards_per_row?: number | null
          updated_at?: string | null
        }
      }
      services_cards: {
        Row: {
          id: string
          title: string
          title_color: string | null
          subheading: string | null
          subheading_color: string | null
          description: string | null
          desc_color: string | null
          image_url: string | null
          page_slug: string
          priority: number | null
          is_visible: boolean | null
          technology_stack: { name: string; svg?: string; is_special?: boolean; image_url?: string }[] | null
          icon_svg: string | null
          capabilities: { title: string; desc: string; metric: string; metricLabel: string }[] | null
          faqs: { question: string; answer: string }[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          title_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          description?: string | null
          desc_color?: string | null
          image_url?: string | null
          page_slug: string
          priority?: number | null
          is_visible?: boolean | null
          technology_stack?: { name: string; svg?: string; is_special?: boolean; image_url?: string }[] | null
          icon_svg?: string | null
          capabilities?: { title: string; desc: string; metric: string; metricLabel: string }[] | null
          faqs?: { question: string; answer: string }[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          title_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          description?: string | null
          desc_color?: string | null
          image_url?: string | null
          page_slug?: string
          priority?: number | null
          is_visible?: boolean | null
          technology_stack?: { name: string; svg?: string; is_special?: boolean; image_url?: string }[] | null
          icon_svg?: string | null
          capabilities?: { title: string; desc: string; metric: string; metricLabel: string }[] | null
          faqs?: { question: string; answer: string }[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      card_tools: {
        Row: {
          id: string
          card_id: string | null
          tool_name: string
          tool_svg_url: string | null
          tool_svg_inline: string | null
          priority: number | null
        }
        Insert: {
          id?: string
          card_id?: string | null
          tool_name: string
          tool_svg_url?: string | null
          tool_svg_inline?: string | null
          priority?: number | null
        }
        Update: {
          id?: string
          card_id?: string | null
          tool_name?: string
          tool_svg_url?: string | null
          tool_svg_inline?: string | null
          priority?: number | null
        }
      }
      case_studies: {
        Row: {
          id: string
          title: string
          slug: string
          cover_image_url: string | null
          short_description: string | null
          body_content: string | null
          tags: string[] | null
          is_featured: boolean | null
          status: string | null
          priority: number | null
          tools_used: string[] | null
          created_at: string | null
          updated_at: string | null
          gallery_images: string[] | null
          pitch_deck_images: string[] | null
          project_length: string | null
          metrics: { label: string; value: string; suffix?: string; prefix?: string }[] | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          cover_image_url?: string | null
          short_description?: string | null
          body_content?: string | null
          tags?: string[] | null
          is_featured?: boolean | null
          status?: string | null
          priority?: number | null
          tools_used?: string[] | null

          created_at?: string | null
          updated_at?: string | null
          gallery_images?: string[] | null
          pitch_deck_images?: string[] | null
          project_length?: string | null
          metrics?: { label: string; value: string; suffix?: string; prefix?: string }[] | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          cover_image_url?: string | null
          short_description?: string | null
          body_content?: string | null
          tags?: string[] | null
          is_featured?: boolean | null
          status?: string | null
          priority?: number | null
          tools_used?: string[] | null

          created_at?: string | null
          updated_at?: string | null
          gallery_images?: string[] | null
          pitch_deck_images?: string[] | null
          project_length?: string | null
          metrics?: { label: string; value: string; suffix?: string; prefix?: string }[] | null
        }
      }
      work_tags: {
        Row: {
          id: string
          label: string
          slug: string
          color: string | null
          priority: number | null
          is_visible: boolean | null
        }
        Insert: {
          id?: string
          label: string
          slug: string
          color?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
        Update: {
          id?: string
          label?: string
          slug?: string
          color?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
      }
      why_choose_us: {
        Row: {
          id: string
          icon_svg: string | null
          stat: string | null
          stat_color: string | null
          label: string
          label_color: string | null
          description: string | null
          desc_color: string | null
          priority: number | null
        }
        Insert: {
          id?: string
          icon_svg?: string | null
          stat?: string | null
          stat_color?: string | null
          label: string
          label_color?: string | null
          description?: string | null
          desc_color?: string | null
          priority?: number | null
        }
        Update: {
          id?: string
          icon_svg?: string | null
          stat?: string | null
          stat_color?: string | null
          label?: string
          label_color?: string | null
          description?: string | null
          desc_color?: string | null
          priority?: number | null
        }
      }
      why_choose_us_config: {
        Row: {
          id: string
          section_heading: string | null
          heading_color: string | null
          section_subheading: string | null
          sub_color: string | null
          cta_text: string | null
          cta_url: string | null
          cta_bg_color: string | null
          cta_hover_bg_color: string | null
          cta_border_radius: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          section_heading?: string | null
          heading_color?: string | null
          section_subheading?: string | null
          sub_color?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_bg_color?: string | null
          cta_hover_bg_color?: string | null
          cta_border_radius?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          section_heading?: string | null
          heading_color?: string | null
          section_subheading?: string | null
          sub_color?: string | null
          cta_text?: string | null
          cta_url?: string | null
          cta_bg_color?: string | null
          cta_hover_bg_color?: string | null
          cta_border_radius?: string | null
          updated_at?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          reviewer_name: string
          reviewer_title: string | null
          company: string | null
          avatar_url: string | null
          company_logo_url: string | null
          review_text: string
          rating: number | null
          priority: number | null
          is_visible: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          reviewer_name: string
          reviewer_title?: string | null
          company?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          review_text: string
          rating?: number | null
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          reviewer_name?: string
          reviewer_title?: string | null
          company?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          review_text?: string
          rating?: number | null
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
        }
      }
      footer_config: {
        Row: {
          id: string
          linkedin_url: string | null
          github_url: string | null
          reddit_url: string | null
          copyright_text: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          linkedin_url?: string | null
          github_url?: string | null
          reddit_url?: string | null
          copyright_text?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          linkedin_url?: string | null
          github_url?: string | null
          reddit_url?: string | null
          copyright_text?: string | null
          updated_at?: string | null
        }
      }
      footer_links: {
        Row: {
          id: string
          section: string
          label: string
          href: string
          priority: number | null
          is_visible: boolean | null
        }
        Insert: {
          id?: string
          section: string
          label: string
          href: string
          priority?: number | null
          is_visible?: boolean | null
        }
        Update: {
          id?: string
          section?: string
          label?: string
          href?: string
          priority?: number | null
          is_visible?: boolean | null
        }
      }
      company_story: {
        Row: {
          id: string
          content_json: Json
          updated_at: string | null
        }
        Insert: {
          id?: string
          content_json: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          content_json?: Json
          updated_at?: string | null
        }
      }
      what_we_do_cards: {
        Row: {
          id: string
          title: string
          title_color: string | null
          description: string | null
          desc_color: string | null
          icon_svg: string | null
          priority: number | null
          is_visible: boolean | null
        }
        Insert: {
          id?: string
          title: string
          title_color?: string | null
          description?: string | null
          desc_color?: string | null
          icon_svg?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          title_color?: string | null
          description?: string | null
          desc_color?: string | null
          icon_svg?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
      }
      core_beliefs: {
        Row: {
          id: string
          title: string
          title_color: string | null
          description: string | null
          desc_color: string | null
          icon_svg: string | null
          priority: number | null
          is_visible: boolean | null
        }
        Insert: {
          id?: string
          title: string
          title_color?: string | null
          description?: string | null
          desc_color?: string | null
          icon_svg?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          title_color?: string | null
          description?: string | null
          desc_color?: string | null
          icon_svg?: string | null
          priority?: number | null
          is_visible?: boolean | null
        }
      }
      how_we_think_config: {
        Row: {
          id: string
          section_heading: string | null
          heading_color: string | null
          section_subheading: string | null
          sub_color: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          section_heading?: string | null
          heading_color?: string | null
          section_subheading?: string | null
          sub_color?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          section_heading?: string | null
          heading_color?: string | null
          section_subheading?: string | null
          sub_color?: string | null
          updated_at?: string | null
        }
      }
      cta_sections: {
        Row: {
          id: string
          section_key: string
          heading: string | null
          heading_color: string | null
          subheading: string | null
          subheading_color: string | null
          description_json: Json | null
          btn_text: string | null
          btn_color: string | null
          btn_hover_color: string | null
          btn_text_color: string | null
          btn_border_radius: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          section_key: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          description_json?: Json | null
          btn_text?: string | null
          btn_color?: string | null
          btn_hover_color?: string | null
          btn_text_color?: string | null
          btn_border_radius?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          section_key?: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          description_json?: Json | null
          btn_text?: string | null
          btn_color?: string | null
          btn_hover_color?: string | null
          btn_text_color?: string | null
          btn_border_radius?: string | null
          updated_at?: string | null
        }
      }
      page_hero_config: {
        Row: {
          id: string
          page: string
          heading: string | null
          heading_color: string | null
          subheading: string | null
          subheading_color: string | null
          bg_gradient_start: string | null
          bg_gradient_end: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          page: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          bg_gradient_start?: string | null
          bg_gradient_end?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          page?: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          bg_gradient_start?: string | null
          bg_gradient_end?: string | null
          updated_at?: string | null
        }
      }
      section_config: {
        Row: {
          id: string
          section_key: string
          heading: string | null
          heading_color: string | null
          subheading: string | null
          subheading_color: string | null
          is_visible: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          section_key: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          is_visible?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          section_key?: string
          heading?: string | null
          heading_color?: string | null
          subheading?: string | null
          subheading_color?: string | null
          is_visible?: boolean | null
          updated_at?: string | null
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          mobile: string | null
          services_interested: string[] | null
          message: string
          is_read: boolean | null
          submitted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          mobile?: string | null
          services_interested?: string[] | null
          message: string
          is_read?: boolean | null
          submitted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          mobile?: string | null
          services_interested?: string[] | null
          message?: string
          is_read?: boolean | null
          submitted_at?: string | null
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          priority: number | null
          is_visible: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question: string
          answer: string
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      home_faqs: {
        Row: {
          id: string
          question: string
          answer: string
          priority: number | null
          is_visible: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          question: string
          answer: string
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          priority?: number | null
          is_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string | null
          old_value: Json | null
          new_value: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string | null
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════
   Convenience Type Aliases
   Used by frontend components for cleaner imports.
   All derived from Database['public']['Tables'][T]['Row'].
   ═══════════════════════════════════════════════════ */

export type ThemeSetting = Database['public']['Tables']['theme_settings']['Row']
export type BrandSettings = Database['public']['Tables']['brand_settings']['Row']
export type NavConfig = Database['public']['Tables']['nav_config']['Row']
export type HeroSettings = Database['public']['Tables']['hero_settings']['Row']
export type ServiceCard = Database['public']['Tables']['services_cards']['Row']
export type CardTool = Database['public']['Tables']['card_tools']['Row']
export type ServicesLayout = Database['public']['Tables']['services_layout']['Row']
export type SectionConfig = Database['public']['Tables']['section_config']['Row']
export type CaseStudy = Database['public']['Tables']['case_studies']['Row']
export type WorkTag = Database['public']['Tables']['work_tags']['Row']
export type WhyChooseUsConfig = Database['public']['Tables']['why_choose_us_config']['Row']
export type WhyChooseUsItem = Database['public']['Tables']['why_choose_us']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type FooterConfig = Database['public']['Tables']['footer_config']['Row']
export type FooterLink = Database['public']['Tables']['footer_links']['Row']
export type CompanyStory = Database['public']['Tables']['company_story']['Row']
export type WhatWeDoCard = Database['public']['Tables']['what_we_do_cards']['Row']
export type CoreBelief = Database['public']['Tables']['core_beliefs']['Row']
export type HowWeThinkConfig = Database['public']['Tables']['how_we_think_config']['Row']
export type CtaSection = Database['public']['Tables']['cta_sections']['Row']
export type PageHeroConfig = Database['public']['Tables']['page_hero_config']['Row']
export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type SeoConfig = Database['public']['Tables']['seo_config']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type Faq = Database['public']['Tables']['faqs']['Row']
export type HomeFaq = Database['public']['Tables']['home_faqs']['Row']
export type AuditLog = Database['public']['Tables']['audit_log']['Row']

/* Content block types used throughout the site */
export interface WordStyle {
  word: string
  color: string
}

export interface ContentBlock {
  text: string
  block_color: string
  words: WordStyle[]
}
