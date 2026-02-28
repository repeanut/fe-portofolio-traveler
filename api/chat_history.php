<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$db_config = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'travello_chat'
];

// Connect to database
try {
    $conn = new mysqli($db_config['host'], $db_config['username'], $db_config['password'], $db_config['database']);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Helper function to send JSON response
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Get request data
$requestData = json_decode(file_get_contents('php://input'), true);
if (!$requestData) {
    $requestData = $_POST;
}

// Extract user info from headers or request
$userId = $_SERVER['HTTP_X_USER_ID'] ?? $requestData['user_id'] ?? 'anonymous_' . time();
$userName = $_SERVER['HTTP_X_USER_NAME'] ?? $requestData['user_name'] ?? 'Anonymous User';
$userEmail = $_SERVER['HTTP_X_USER_EMAIL'] ?? $requestData['user_email'] ?? 'anonymous@example.com';

// Ensure user exists in database
function ensureUser($conn, $userId, $userName, $userEmail) {
    $checkUser = $conn->prepare("SELECT id FROM users WHERE user_id = ?");
    $checkUser->bind_param("s", $userId);
    $checkUser->execute();
    $result = $checkUser->get_result();
    
    if ($result->num_rows === 0) {
        $insertUser = $conn->prepare("INSERT INTO users (user_id, name, email) VALUES (?, ?, ?)");
        $insertUser->bind_param("sss", $userId, $userName, $userEmail);
        $insertUser->execute();
    }
}

// Main API logic based on request method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        // Save chat message
        if (!isset($requestData['action'])) {
            sendResponse(false, 'Action is required');
        }
        
        switch ($requestData['action']) {
            case 'save_message':
                $required = ['session_id', 'content', 'role', 'name', 'timestamp'];
                foreach ($required as $field) {
                    if (!isset($requestData[$field])) {
                        sendResponse(false, "Missing required field: $field");
                    }
                }
                
                ensureUser($conn, $userId, $userName, $userEmail);
                
                // Ensure session exists
                $sessionId = $requestData['session_id'];
                $language = $requestData['language'] ?? 'en';
                $chatMode = $requestData['chat_mode'] ?? 'ai';
                
                $checkSession = $conn->prepare("SELECT id FROM chat_sessions WHERE session_id = ?");
                $checkSession->bind_param("s", $sessionId);
                $checkSession->execute();
                $sessionResult = $checkSession->get_result();
                
                if ($sessionResult->num_rows === 0) {
                    $insertSession = $conn->prepare("INSERT INTO chat_sessions (session_id, user_id, language, chat_mode) VALUES (?, ?, ?, ?)");
                    $insertSession->bind_param("ssss", $sessionId, $userId, $language, $chatMode);
                    $insertSession->execute();
                } else {
                    // Update session language and mode
                    $updateSession = $conn->prepare("UPDATE chat_sessions SET language = ?, chat_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?");
                    $updateSession->bind_param("sss", $language, $chatMode, $sessionId);
                    $updateSession->execute();
                }
                
                // Save message
                $messageId = $requestData['message_id'] ?? 'msg_' . time() . '_' . rand(1000, 9999);
                $content = $requestData['content'];
                $role = $requestData['role'];
                $name = $requestData['name'];
                $timestamp = $requestData['timestamp'];
                $messageType = $requestData['message_type'] ?? 'text';
                $imageUrl = $requestData['image_url'] ?? null;
                $suggestions = isset($requestData['suggestions']) ? json_encode($requestData['suggestions']) : null;
                $followUpQuestions = isset($requestData['follow_up_questions']) ? json_encode($requestData['follow_up_questions']) : null;
                
                $insertMessage = $conn->prepare("INSERT INTO chat_messages (message_id, session_id, user_id, content, role, name, timestamp, message_type, image_url, suggestions, follow_up_questions, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $insertMessage->bind_param("ssssssssssss", $messageId, $sessionId, $userId, $content, $role, $name, $timestamp, $messageType, $imageUrl, $suggestions, $followUpQuestions, $language);
                
                if ($insertMessage->execute()) {
                    sendResponse(true, 'Message saved successfully', ['message_id' => $messageId]);
                } else {
                    sendResponse(false, 'Failed to save message');
                }
                break;
                
            case 'end_session':
                if (!isset($requestData['session_id'])) {
                    sendResponse(false, 'Session ID is required');
                }
                
                $sessionId = $requestData['session_id'];
                $updateSession = $conn->prepare("UPDATE chat_sessions SET is_active = FALSE, ended_at = CURRENT_TIMESTAMP WHERE session_id = ? AND user_id = ?");
                $updateSession->bind_param("ss", $sessionId, $userId);
                
                if ($updateSession->execute()) {
                    sendResponse(true, 'Session ended successfully');
                } else {
                    sendResponse(false, 'Failed to end session');
                }
                break;
                
            case 'save_analytics':
                if (!isset($requestData['session_id']) || !isset($requestData['message_category'])) {
                    sendResponse(false, 'Session ID and message category are required');
                }
                
                ensureUser($conn, $userId, $userName, $userEmail);
                
                $sessionId = $requestData['session_id'];
                $messageCategory = $requestData['message_category'];
                $languageUsed = $requestData['language_used'] ?? 'en';
                $responseTime = $requestData['response_time_ms'] ?? null;
                $userSatisfaction = $requestData['user_satisfaction'] ?? null;
                $feedbackText = $requestData['feedback_text'] ?? null;
                
                $insertAnalytics = $conn->prepare("INSERT INTO ai_analytics (session_id, user_id, message_category, language_used, response_time_ms, user_satisfaction, feedback_text) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $insertAnalytics->bind_param("ssssiss", $sessionId, $userId, $messageCategory, $languageUsed, $responseTime, $userSatisfaction, $feedbackText);
                
                if ($insertAnalytics->execute()) {
                    sendResponse(true, 'Analytics saved successfully');
                } else {
                    sendResponse(false, 'Failed to save analytics');
                }
                break;
                
            default:
                sendResponse(false, 'Invalid action');
        }
        break;
        
    case 'GET':
        // Get chat history
        if (!isset($_GET['action'])) {
            sendResponse(false, 'Action is required');
        }
        
        switch ($_GET['action']) {
            case 'get_sessions':
                ensureUser($conn, $userId, $userName, $userEmail);
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $getSessions = $conn->prepare("SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?");
                $getSessions->bind_param("sii", $userId, $limit, $offset);
                $getSessions->execute();
                $sessions = $getSessions->get_result()->fetch_all(MYSQLI_ASSOC);
                
                sendResponse(true, 'Sessions retrieved successfully', $sessions);
                break;
                
            case 'get_messages':
                if (!isset($_GET['session_id'])) {
                    sendResponse(false, 'Session ID is required');
                }
                
                $sessionId = $_GET['session_id'];
                $getMessages = $conn->prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC");
                $getMessages->bind_param("s", $sessionId);
                $getMessages->execute();
                $messages = $getMessages->get_result()->fetch_all(MYSQLI_ASSOC);
                
                // Parse JSON fields
                foreach ($messages as &$message) {
                    if ($message['suggestions']) {
                        $message['suggestions'] = json_decode($message['suggestions'], true);
                    }
                    if ($message['follow_up_questions']) {
                        $message['follow_up_questions'] = json_decode($message['follow_up_questions'], true);
                    }
                }
                
                sendResponse(true, 'Messages retrieved successfully', $messages);
                break;
                
            case 'get_analytics':
                ensureUser($conn, $userId, $userName, $userEmail);
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $getAnalytics = $conn->prepare("SELECT * FROM ai_analytics WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
                $getAnalytics->bind_param("sii", $userId, $limit, $offset);
                $getAnalytics->execute();
                $analytics = $getAnalytics->get_result()->fetch_all(MYSQLI_ASSOC);
                
                sendResponse(true, 'Analytics retrieved successfully', $analytics);
                break;
                
            default:
                sendResponse(false, 'Invalid action');
        }
        break;
        
    default:
        sendResponse(false, 'Method not allowed');
}

// Close database connection
$conn->close();
?>
