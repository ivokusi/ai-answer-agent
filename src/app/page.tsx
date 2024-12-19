"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();

  const startNewChat = async () => {
    try {
      const conversationId = uuidv4();
      const response = await fetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ conversationId, messages: [{ role: "assistant", content: "Hello! How can I help you today?" }] }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="w-full bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-white">AI Answer Engine</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to AI Answer Engine
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Your intelligent assistant for finding answers and having meaningful conversations.
          </p>
          <button
            onClick={startNewChat}
            className="bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition-all"
          >
            Start a New Chat
          </button>
        </div>
      </div>
    </div>
  );
}