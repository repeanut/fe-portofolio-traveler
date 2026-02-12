import React from 'react';
import { AIChatbotProvider, AIChatbotButton, useAIChatbotControls } from '../components/AIchatbot';
import { Bot, MessageCircle, Sparkles, Info, TestTube } from 'lucide-react';

const DemoContent: React.FC = () => {
  const { isOpen, unreadCount } = useAIChatbotControls();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Chatbot Demo</h1>
                <p className="text-sm text-gray-500">Copywriter & Travel Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Chatbot {isOpen ? 'Active' : 'Inactive'}</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI Assistant TRAVELLO
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Experience intelligent auto-response for copywriter services and travel consultation. 
            Click the chat button to start interacting with our AI assistant.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <AIChatbotButton 
              label="Start Chat" 
              size="lg" 
              variant="prominent"
              className="shadow-lg"
            />
            <AIChatbotButton 
              label="Quick Help" 
              size="md" 
              variant="minimal"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Copywriter Services</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Article writing & blog content creation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Social media copywriting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Sales letters & marketing content</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>SEO writing & product descriptions</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                <strong>Try asking:</strong> "Harga copywriter artikel" or "Proses pengerjaan copywriting"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Travel Consultation</h3>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Destination recommendations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Tour packages & accommodations</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Budget travel tips</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Itinerary planning</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Try asking:</strong> "Rekomendasi destinasi Bali" or "Tips hemat traveling"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-gray-600" />
            <span>Sample Questions to Try</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Copywriter Questions:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• "Berapa harga jasa copywriter?"</li>
                <li>• "Apa saja yang termasuk dalam paket copywriting?"</li>
                <li>• "Bagaimana proses pengerjaan artikel?"</li>
                <li>• "Apakah tersedia SEO writing?"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Travel Questions:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• "Destinasi wisata terbaik di Indonesia"</li>
                <li>• "Paket hemat liburan ke Bali"</li>
                <li>• "Tips traveling untuk backpacker"</li>
                <li>• "Rekomendasi hotel murah di Jogja"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5 text-purple-600" />
            <span>Integration Information</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backend API:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Health Check: <code className="bg-white px-2 py-1 rounded">GET /api/ai-chatbot/health</code></li>
                <li>• Chat Endpoint: <code className="bg-white px-2 py-1 rounded">POST /api/ai-chatbot/chat</code></li>
                <li>• Suggestions: <code className="bg-white px-2 py-1 rounded">GET /api/ai-chatbot/suggestions</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frontend Components:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <code className="bg-white px-2 py-1 rounded">AIAutoChatbot</code> - Main chat component</li>
                <li>• <code className="bg-white px-2 py-1 rounded">AIChatbotButton</code> - Floating button</li>
                <li>• <code className="bg-white px-2 py-1 rounded">AIChatbotProvider</code> - Context provider</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>AI Chatbot Demo - Copywriter & Travel Assistant</p>
            <p className="mt-1">Powered by TRAVELLO AI Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AIChatbotDemo: React.FC = () => {
  return (
    <AIChatbotProvider 
      theme="light"
      position="bottom-right"
      autoOpen={false}
      showWelcome={true}
    >
      <DemoContent />
    </AIChatbotProvider>
  );
};

export default AIChatbotDemo;
