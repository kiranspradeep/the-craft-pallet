UPDATE asset_files
SET preview_path = 'uploads/thumbnails/' || 
    SPLIT_PART(stored_name, '.', 1) || '_thumb.jpg'
WHERE preview_path IS NULL
  AND stored_name IS NOT NULL;