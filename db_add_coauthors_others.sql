-- Add co_authors to documents
ALTER TABLE documents ADD COLUMN co_authors TEXT DEFAULT '';

-- Add poster and co_authors to books
ALTER TABLE books ADD COLUMN poster TEXT DEFAULT 'Unknown';
ALTER TABLE books ADD COLUMN co_authors TEXT DEFAULT '';

-- Add co_authors to projects
ALTER TABLE projects ADD COLUMN co_authors TEXT DEFAULT '';
