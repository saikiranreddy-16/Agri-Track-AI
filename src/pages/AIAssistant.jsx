import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, FaPaperPlane, FaMicrophone, FaPaperclip, 
  FaArrowRight, FaCommentAlt, FaHistory, FaTractor, FaGasPump, FaRedo, FaTrash 
} from 'react-icons/fa';
import { 
  chat, 
  getDailyReport, 
  getWeeklyReport, 
  analyzeFuel, 
  summarizeMachine 
} from '../services/aiService';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      id: 'm-init', 
      sender: 'AI', 
      text: "Hello! I am your AgriTrack Farm Operations AI Copilot. I can compile fuel statistics, fetch machinery diagnostic codes, analyze operator shifts, and predict service schedules. Ask me anything about your active fields or vehicle fleet.", 
      time: '12:00 PM' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const messagesEndRef = useRef(null);

  const [activeSession, setActiveSession] = useState('Active Session 1');
  const pastSessions = [
    'Active Session 1',
    'Fuel Analysis Jun 12',
    'Driver Safety Check',
    'Yield Report Sectors'
  ];

  const suggestedPrompts = [
    { text: "Analyze today's fuel efficiency", serviceOverride: 'fuel' },
    { text: "Generate weekly fleet report", serviceOverride: 'weekly' },
    { text: "Generate daily status report", serviceOverride: 'daily' }
  ];

  // Auto-scroll chat log
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text, serviceOverride = null) => {
    const queryText = text || '';
    if (!queryText.trim() && !serviceOverride) return;

    const userMessage = {
      id: `m-u-${Date.now()}`,
      sender: 'User',
      text: queryText || `Trigger: ${serviceOverride} analysis`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);
    setError(null);
    setLastAction({ text: queryText, serviceOverride });

    try {
      let result;
      // Dynamically select target endpoint based on input text or serviceOverride
      if (serviceOverride === 'fuel' || queryText.toLowerCase().includes('fuel')) {
        result = await analyzeFuel();
      } else if (serviceOverride === 'weekly' || queryText.toLowerCase().includes('weekly')) {
        result = await getWeeklyReport();
      } else if (serviceOverride === 'daily' || queryText.toLowerCase().includes('daily')) {
        result = await getDailyReport();
      } else if (serviceOverride === 'machine' || queryText.toLowerCase().includes('machine') || queryText.toLowerCase().includes('tractor')) {
        result = await summarizeMachine();
      } else {
        result = await chat(queryText);
      }

      if (result && result.success) {
        setMessages(prev => [
          ...prev,
          { 
            id: `m-ai-${Date.now()}`, 
            sender: 'AI', 
            text: result.response, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      } else {
        throw new Error(result?.message || 'Failed to generate response.');
      }
    } catch (err) {
      console.error('AI assistant request failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to connect to the AI service.';
      setError(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastAction) {
      handleSendMessage(lastAction.text, lastAction.serviceOverride);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { 
        id: 'm-init', 
        sender: 'AI', 
        text: "Hello! I am your AgriTrack Farm Operations AI Copilot. I can compile fuel statistics, fetch machinery diagnostic codes, analyze operator shifts, and predict service schedules. Ask me anything about your active fields or vehicle fleet.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
    setError(null);
    setLastAction(null);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-4 relative overflow-hidden -m-4 md:-m-6">
      
      {/* Session History Sidebar */}
      <div className="w-60 shrink-0 bg-white dark:bg-[#0e1712] border-r border-gray-200 dark:border-emerald-950/30 hidden md:flex flex-col h-full z-10 select-none">
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/20">
          <h2 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FaHistory /> Chat Sessions
          </h2>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
          {pastSessions.map((session) => (
            <button
              key={session}
              onClick={() => setActiveSession(session)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2.5 ${
                activeSession === session
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-emerald-950/10 dark:text-gray-400'
              }`}
            >
              <FaCommentAlt className="text-[10px] shrink-0" />
              <span className="truncate">{session}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-150 dark:border-emerald-950/25">
          <button
            onClick={handleClearChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold bg-gray-50 hover:bg-red-50 dark:bg-emerald-950/10 dark:hover:bg-red-950/20 text-gray-600 dark:text-gray-300 hover:text-red-650 dark:hover:text-red-400 border border-gray-200 dark:border-emerald-900/30 hover:border-red-200 dark:hover:border-red-950/30 rounded-xl transition-all shadow-sm"
          >
            <FaTrash className="text-[10px]" /> Clear Chat History
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0e1712]">
        
        {/* Chat Window header */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FaRobot className="text-lg animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold dark:text-white">AgriTrack AI Assistant</h2>
            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Central AI Service Module
            </span>
          </div>
          
          <button
            onClick={handleClearChat}
            className="ml-auto md:hidden text-xs font-bold p-2.5 border border-gray-200 hover:bg-red-50 dark:border-emerald-950/40 dark:hover:bg-red-950/25 text-gray-500 hover:text-red-650 dark:text-emerald-450 dark:hover:text-red-400 rounded-xl transition-all"
            title="Clear Chat"
          >
            <FaTrash className="text-[10px]" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-50/20 dark:bg-[#080d0a]/20">
          {messages.map((msg) => {
            const isAI = msg.sender === 'AI';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/20">
                    <FaRobot className="text-sm" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                    isAI
                      ? 'bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 text-gray-800 dark:text-gray-100'
                      : 'bg-emerald-600 text-white font-semibold'
                  }`}>
                    {/* Render raw strings with simple markdown formats (lists & tables) */}
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('* ')) {
                        return <li key={lIdx} className="ml-4 list-disc my-0.5">{line.substring(2)}</li>;
                      }
                      if (line.startsWith('|')) {
                        // Very simple tables formatting helper
                        return <div key={lIdx} className="font-mono text-[10px] leading-normal">{line}</div>;
                      }
                      return <p key={lIdx} className={line === '' ? 'h-2' : 'my-1'}>{line}</p>;
                    })}
                  </div>
                  <span className={`text-[9px] text-gray-400 font-semibold block ${isAI ? 'text-left pl-1' : 'text-right pr-1'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing dots */}
          {isTyping && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FaRobot className="text-sm" />
              </div>
              <div className="p-3 bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/20 rounded-2xl flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-450 dark:bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-450 dark:bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-450 dark:bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="p-3 mx-4 md:mx-6 mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 rounded-xl flex items-center justify-between text-xs text-red-700 dark:text-red-400">
            <span className="truncate mr-4"><strong>Connection Error:</strong> {error}</span>
            <button 
              onClick={handleRetry} 
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg font-bold shadow-sm transition-all text-[11px] cursor-pointer"
            >
              <FaRedo className="text-[9px]" /> Retry
            </button>
          </div>
        )}

        {/* Suggested Prompts helper grid */}
        {messages.length === 1 && !isTyping && (
          <div className="p-4 border-t border-gray-100 dark:border-emerald-950/20 bg-gray-50/50 dark:bg-[#080d0a]/20 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">Suggested Prompts</span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleSendMessage(p.text, p.serviceOverride)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-gray-600 dark:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all cursor-pointer shadow-sm"
                >
                  {p.text} <FaArrowRight className="text-[9px] text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Form Area */}
        <div className="p-4 border-t border-gray-100 dark:border-emerald-950/25 shrink-0 bg-white dark:bg-[#0e1712] flex gap-2">
          
          <button 
            className="p-3 bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl text-gray-400 hover:text-gray-600 shrink-0"
            title="Attach documents"
          >
            <FaPaperclip />
          </button>
          
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(inputVal); }}
            placeholder="Ask AI Copilot about fuel, alerts, or machine logs..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
            disabled={isTyping}
          />

          <button 
            className="p-3 bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl text-gray-400 hover:text-gray-600 shrink-0"
            title="Voice Commands Placeholder"
          >
            <FaMicrophone />
          </button>

          <button
            onClick={() => handleSendMessage(inputVal)}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shrink-0 flex items-center justify-center"
            title="Send Message"
            disabled={isTyping}
          >
            <FaPaperPlane className="text-xs" />
          </button>

        </div>

      </div>

    </div>
  );
};

export default AIAssistant;
