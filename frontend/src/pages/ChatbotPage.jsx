/**
 * ChatbotPage — AI Career Assistant chat interface.
 * Sends user's resume context for personalized advice.
 */
import { useState, useRef, useEffect } from 'react';
import aiService from '../services/aiService';
import authService from '../services/authService';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI Career Copilot. I can help you with resume tips, interview prep, career advice, and more. What would you like to discuss?"
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [resumeContext, setResumeContext] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's resume context on mount for personalized advice
  useEffect(() => {
    loadResumeContext();
  }, []);

  const loadResumeContext = async () => {
    try {
      const data = await authService.getDashboard();
      const parts = [];
      if (data.skills?.length > 0) {
        parts.push(`User's skills: ${data.skills.join(', ')}`);
      }
      if (data.missing_skills?.length > 0) {
        parts.push(`Skills to develop: ${data.missing_skills.join(', ')}`);
      }
      if (data.latest_score > 0) {
        parts.push(`Latest resume score: ${data.latest_score}/100`);
      }
      if (data.avg_match > 0) {
        parts.push(`Average job match rate: ${data.avg_match}%`);
      }
      if (parts.length > 0) {
        setResumeContext(parts.join('. '));
      }
    } catch (err) {
      console.error('Failed to load resume context:', err);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const response = await aiService.chat(
        newMessages.filter((m) => m.role !== 'system'),
        resumeContext
      );
      setMessages([...newMessages, response.data]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const sendQuickPrompt = async (prompt) => {
    const userMsg = { role: 'user', content: prompt };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setSending(true);
    try {
      const response = await aiService.chat(
        newMsgs.filter((m) => m.role !== 'system'),
        resumeContext
      );
      setMessages([...newMsgs, response.data]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: '❌ Error. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    "How can I improve my resume?",
    "Tips for technical interviews",
    "What skills should I learn in 2026?",
    "How to negotiate salary?",
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>💬 AI Career Assistant</h1>
        <p>Get personalized career advice powered by AI{resumeContext ? ' — using your resume context' : ''}</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages" style={{ padding: '24px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            ))}
            {sending && (
              <div className="chat-bubble assistant" style={{ opacity: 0.6 }}>
                <span>⏳ Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (show only when few messages) */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 24px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="btn btn-secondary btn-sm"
                  onClick={() => sendQuickPrompt(prompt)}
                  disabled={sending}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Ask me anything about your career..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sending}
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending ? '⏳' : '📤'} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
