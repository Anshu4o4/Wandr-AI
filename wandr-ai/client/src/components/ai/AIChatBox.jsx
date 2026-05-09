import React, { useState, useRef, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, X, Send, Bot, User, Trash2 } from 'lucide-react';

export const AIChatBox = ({ inline = false, initialContext = null }) => {
  const { isChatOpen, toggleChat, chatMessages, addChatMessage, clearChat } = useUiStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const suggestions = initialContext
    ? ['Add hidden gems', 'Suggest better budget', 'Improve pacing', 'Find best time to go']
    : ['Plan a weekend trip', 'Recommend a luxury escape', 'Build a family itinerary', 'Compare destinations'];
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    // Call the streaming API directly here using fetch
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken || ''}`, // Use Zustand accessToken
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          context: initialContext,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch from AI');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let aiResponse = '';
      
      // Add empty assistant message that we will update
      addChatMessage({ role: 'assistant', content: '' });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE format: data: {"content": "..."}\n\n
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                aiResponse += parsed.content;
                
                // Update the last message in the store
                useUiStore.setState((state) => {
                  const newMessages = [...state.chatMessages];
                  if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: aiResponse };
                  }
                  return { chatMessages: newMessages };
                });
              }
            } catch (err) {
              // Ignore partial JSON or markers
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({ role: 'assistant', content: 'Oops, something went wrong. Let\'s try again.' });
    } finally {
      setIsTyping(false);
    }
  };

  // If inline, render just the chat body, no floating button
  if (inline) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ChatHeader onClear={clearChat} />
        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <ChatBody messages={chatMessages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
        <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isTyping={isTyping} />
      </div>
    );
  }

  // Floating generic chat
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all transform hover:scale-105 z-[60] focus:outline-none ${isChatOpen ? 'bg-slate-800 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Floating Chat Container */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 z-[60] flex h-[550px] max-h-[75vh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:w-[380px] animate-fadeIn">
          <ChatHeader onClear={clearChat} />
          <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:text-primary-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <ChatBody messages={chatMessages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
          <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} isTyping={isTyping} />
        </div>
      )}
    </>
  );
};

const ChatHeader = ({ onClear }) => (
  <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-primary-600 to-secondary-500 p-4 text-white">
    <div className="flex items-center space-x-2">
      <div className="rounded-2xl bg-white/15 p-2">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">Wandr AI Assistant</h3>
        <p className="text-xs text-white/80">Always here to help</p>
      </div>
    </div>
    <button onClick={onClear} className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20" title="Clear Chat">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

const ChatBody = ({ messages, isTyping, messagesEndRef }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
    {messages.map((msg, index) => (
      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 ml-2' : 'bg-primary-100 mr-2'}`}>
            {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-primary-600" />}
          </div>
          <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
            msg.role === 'user' 
              ? 'bg-primary-600 text-white rounded-tr-sm' 
              : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      </div>
    ))}
    {isTyping && (
      <div className="flex justify-start">
        <div className="flex items-center bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm shadow-sm ml-10">
          <div className="flex space-x-1 content-center">
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

const ChatInput = ({ input, setInput, handleSubmit, isTyping }) => (
  <div className="border-t border-slate-100 bg-white p-3">
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question about your trip..."
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        disabled={isTyping}
      />
      <button
        type="submit"
        disabled={!input.trim() || isTyping}
        className="absolute right-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 p-2 text-white transition-all hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none disabled:opacity-50"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </form>
  </div>
);
