CREATE TABLE memories (id SERIAL PRIMARY KEY, title TEXT, media_type TEXT, media_data TEXT, note TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE tasks (id SERIAL PRIMARY KEY, title TEXT, completed BOOLEAN DEFAULT FALSE);
CREATE TABLE assignments (id SERIAL PRIMARY KEY, title TEXT, deadline DATE, completed BOOLEAN DEFAULT FALSE);
CREATE TABLE anniversary (id INTEGER PRIMARY KEY DEFAULT 1, date DATE, note TEXT);
