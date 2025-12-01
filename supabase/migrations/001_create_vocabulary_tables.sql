-- Migration: Create vocabulary tables with RLS policies
-- Description: Creates dictionary and user_progress tables with proper constraints and Row Level Security

-- Create dictionary table
CREATE TABLE IF NOT EXISTS dictionary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    english_word TEXT NOT NULL UNIQUE,
    chinese_translation TEXT NOT NULL,
    example_sentence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on english_word for faster lookups
CREATE INDEX IF NOT EXISTS idx_dictionary_english_word ON dictionary(english_word);

-- Create index on created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_dictionary_created_at ON dictionary(created_at);

-- Enable RLS on dictionary table
ALTER TABLE dictionary ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for dictionary: Allow SELECT for all users (including anonymous)
-- This allows read-only access to the vocabulary words
CREATE POLICY "Allow public read access on dictionary" ON dictionary
    FOR SELECT
    USING (true);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT NOT NULL,
    word_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('new', 'known', 'unknown')),
    last_reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, word_id),
    FOREIGN KEY (word_id) REFERENCES dictionary(id) ON DELETE CASCADE
);

-- Create indexes for user_progress table
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_reviewed ON user_progress(last_reviewed_at);

-- Enable RLS on user_progress table
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_progress SELECT: Users can only see their own progress
CREATE POLICY "Allow users to see their own progress" ON user_progress
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Create RLS policy for user_progress INSERT: Users can only insert their own progress
CREATE POLICY "Allow users to insert their own progress" ON user_progress
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policy for user_progress UPDATE: Users can only update their own progress
CREATE POLICY "Allow users to update their own progress" ON user_progress
    FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policy for user_progress DELETE: Users can only delete their own progress
CREATE POLICY "Allow users to delete their own progress" ON user_progress
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_dictionary_updated_at
    BEFORE UPDATE ON dictionary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample vocabulary words (optional, for testing)
INSERT INTO dictionary (english_word, chinese_translation, example_sentence) VALUES
    ('hello', '你好', 'Hello, how are you today?'),
    ('world', '世界', 'The world is full of opportunities.'),
    ('learn', '学习', 'I want to learn new vocabulary every day.'),
    ('vocabulary', '词汇', 'Building vocabulary is essential for language learning.'),
    ('practice', '练习', 'Daily practice helps improve language skills.'),
    ('progress', '进步', 'I can see my progress in learning Chinese.'),
    ('language', '语言', 'Language learning requires patience and dedication.'),
    ('knowledge', '知识', 'Knowledge is power in today''s world.')
ON CONFLICT (english_word) DO NOTHING;

-- Grant necessary permissions (Supabase handles this automatically, but explicit for clarity)
GRANT SELECT ON dictionary TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_progress TO authenticated;