-- Database: travello_chat
-- Chat History Table for AI Chatbot

CREATE DATABASE IF NOT EXISTS travello_chat;
USE travello_chat;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    chat_mode ENUM('idle', 'ai', 'cs') DEFAULT 'idle',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    role ENUM('user', 'admin', 'ai') NOT NULL,
    name VARCHAR(255) NOT NULL,
    timestamp VARCHAR(10) NOT NULL,
    message_type ENUM('text', 'image') DEFAULT 'text',
    image_url VARCHAR(500) NULL,
    suggestions JSON NULL, -- Store suggestions as JSON array
    follow_up_questions JSON NULL, -- Store follow-up questions as JSON array
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- AI analytics table
CREATE TABLE IF NOT EXISTS ai_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    message_category VARCHAR(50) NULL, -- destinations, accommodation, etc.
    language_used VARCHAR(10) NOT NULL,
    response_time_ms INT NULL, -- Response time in milliseconds
    user_satisfaction ENUM('positive', 'negative', 'neutral') NULL,
    feedback_text TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_is_active ON chat_sessions(is_active);
CREATE INDEX idx_ai_analytics_session_id ON ai_analytics(session_id);
CREATE INDEX idx_ai_analytics_created_at ON ai_analytics(created_at);

-- Sample data (optional)
INSERT INTO users (user_id, name, email) VALUES 
('user_123456', 'John Doe', 'john@example.com'),
('user_789012', 'Jane Smith', 'jane@example.com')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);
