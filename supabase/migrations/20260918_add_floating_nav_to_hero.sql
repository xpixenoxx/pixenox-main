-- Add floating_nav_items JSONB column to hero_settings table
ALTER TABLE hero_settings 
ADD COLUMN floating_nav_items JSONB DEFAULT '[
  {"id": "home", "label": "Home", "href": "/", "icon": "logo"},
  {"id": "careers", "label": "Careers", "href": "/careers", "icon": "Briefcase"},
  {"id": "work", "label": "Work", "href": "#", "icon": "FolderGit2"},
  {"id": "contact", "label": "Contact", "href": "#", "icon": "Mail"}
]'::jsonb;
