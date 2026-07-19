import React, { useState, useEffect, useRef } from 'react';
import { 
  FaRobot, FaPaperPlane, FaMicrophone, FaPaperclip, 
  FaArrowRight, FaCommentAlt, FaHistory, 
  FaRedo, FaTrash, FaPen, FaArchive, FaPlus, FaCopy, 
  FaThumbsUp, FaThumbsDown, FaSearch
} from 'react-icons/fa';
import { 
  createConversation,
  sendMessage,
  getConversation,
  getConversationList,
  renameConversation,
  archiveConversation,
  deleteConversation,
  clearConversation,
  submitFeedback
} from '../services/aiService';

export const AIAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState('');

  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { text: "Today's Report" },
    { text: "Weekly Report" },
    { text: "Monthly Report" },
    { text: "Inactive Vehicles" },
    { text: "Fuel Report" },
    { text: "Maintenance" },
    { text: "Compare Two Days" },
    { text: "Compare Two Months" },
    { text: "GPS Summary" },
    { text: "Fleet Summary" }
  ];

  // Auto-scroll chat log
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages, isTyping]);

  // Load chat sessions on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch full conversation when ID changes
  useEffect(() => {
    if (selectedId) {
      const fetchDetail = async () => {
        try {
          const response = await getConversation(selectedId);
          if (response && response.success) {
            setSelectedConversation(response.data);
            setError(null);
          }
        } catch (err) {
          console.error('Error fetching conversation detail:', err);
          setError('Failed to load conversation messages.');
        }
      };
      fetchDetail();
    } else {
      setSelectedConversation(null);
    }
  }, [selectedId]);

  const loadConversations = async () => {
    try {
      const response = await getConversationList();
      if (response && response.success) {
        setConversations(response.data);
        if (response.data.length > 0 && !selectedId) {
          // Select the first active chat by default
          const activeChats = response.data.filter(c => !c.isArchived);
          if (activeChats.length > 0) {
            setSelectedId(activeChats[0]._id);
          } else {
            setSelectedId(response.data[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load chat list.');
    }
  };

  const handleSendMessage = async (text, serviceOverride = null) => {
    const queryText = text || inputVal;
    if (!queryText.trim() && !serviceOverride) return;

    let activeId = selectedId;

    if (!activeId) {
      // 1. Create a conversation session dynamically
      try {
        const createRes = await createConversation(queryText.substring(0, 24) || 'New Chat');
        if (createRes && createRes.success) {
          const newConv = createRes.data;
          setConversations(prev => [newConv, ...prev]);
          setSelectedId(newConv._id);
          activeId = newConv._id;
        } else {
          throw new Error('Failed to create new conversation session.');
        }
      } catch (err) {
        console.error(err);
        setError('Could not initialize conversation.');
        return;
      }
    }

    await performSendMessage(activeId, queryText, serviceOverride);
  };

  const performSendMessage = async (convId, queryText, serviceOverride) => {
    setIsTyping(true);
    setError(null);
    setLastAction({ convId, text: queryText, serviceOverride });

    // Append temporary query turn to UI for immediate visual feedback
    const tempUserTurn = {
      sender: 'user',
      originalQuestion: queryText,
      timestamp: new Date().toISOString()
    };
    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...(prev.messages || []), tempUserTurn]
      };
    });
    setInputVal('');

    try {
      const result = await sendMessage(convId, queryText);
      if (result && result.success) {
        // Update messages with backend response (includes optimized prompt, response time etc)
        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: result.messages || []
          };
        });

        // Refresh lists to sync titles or update timestamps
        const listRes = await getConversationList();
        if (listRes && listRes.success) {
          setConversations(listRes.data);
        }
      } else {
        throw new Error(result?.message || 'Empty response.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error communicating with AI service.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const response = await createConversation('New Chat');
      if (response && response.success) {
        setConversations(prev => [response.data, ...prev]);
        setSelectedId(response.data._id);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to start a new chat session.');
    }
  };

  const handleRenameChat = async (id) => {
    if (!renameText.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const response = await renameConversation(id, renameText);
      if (response && response.success) {
        setConversations(prev => prev.map(c => c._id === id ? { ...c, title: renameText } : c));
        if (selectedId === id) {
          setSelectedConversation(prev => prev ? { ...prev, title: renameText } : null);
        }
        setRenamingId(null);
        setRenameText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveChat = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await archiveConversation(id);
      if (response && response.success) {
        setConversations(prev => prev.map(c => c._id === id ? { ...c, isArchived: response.data.isArchived } : c));
        // Reset selected if archived
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await deleteConversation(id);
      if (response && response.success) {
        setConversations(prev => prev.filter(c => c._id !== id));
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearChat = async (id) => {
    if (!window.confirm('Are you sure you want to clear all message logs?')) return;
    try {
      const response = await clearConversation(id);
      if (response && response.success) {
        setSelectedConversation(prev => {
          if (!prev) return null;
          return { ...prev, messages: [] };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedback = async (id, feedbackType) => {
    try {
      const currentFeedback = selectedConversation?.feedback;
      const newFeedback = currentFeedback === feedbackType ? null : feedbackType;
      
      const response = await submitFeedback(id, newFeedback);
      if (response && response.success) {
        setSelectedConversation(prev => {
          if (!prev) return null;
          return { ...prev, feedback: newFeedback };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied AI Response to clipboard!');
  };

  const handleRetry = () => {
    if (lastAction) {
      performSendMessage(lastAction.convId, lastAction.text, lastAction.serviceOverride);
    }
  };

  const startRenameFlow = (id, currentTitle, e) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameText(currentTitle);
  };

  // Filter sidebar logs
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (showArchived ? c.isArchived : !c.isArchived);
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-4 relative overflow-hidden -m-4 md:-m-6">
      
      {/* Session History Sidebar */}
      <div className="w-64 shrink-0 bg-white dark:bg-[#0e1712] border-r border-gray-200 dark:border-emerald-950/30 hidden md:flex flex-col h-full z-10 select-none">
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FaHistory /> {showArchived ? 'Archived Chats' : 'Chat Sessions'}
            </h2>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 hover:underline cursor-pointer"
            >
              {showArchived ? 'Active list' : 'Archived list'}
            </button>
          </div>
          
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> New Chat
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-55 dark:bg-emerald-950/20 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
            />
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 font-semibold">
              No sessions found.
            </div>
          ) : (
            filteredConversations.map((session) => (
              <div
                key={session._id}
                onClick={() => { if (renamingId !== session._id) setSelectedId(session._id); }}
                className={`group w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                  selectedId === session._id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-emerald-950/10 dark:text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <FaCommentAlt className="text-[10px] shrink-0" />
                  {renamingId === session._id ? (
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameChat(session._id); }}
                      onBlur={() => handleRenameChat(session._id)}
                      className="bg-transparent border-b border-emerald-500 outline-none text-xs w-full text-gray-800 dark:text-white font-semibold"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{session.title}</span>
                  )}
                </div>

                {renamingId !== session._id && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={(e) => startRenameFlow(session._id, session.title, e)}
                      className="p-1 hover:text-emerald-600"
                      title="Rename"
                    >
                      <FaPen className="text-[9px]" />
                    </button>
                    <button
                      onClick={(e) => handleArchiveChat(session._id, e)}
                      className="p-1 hover:text-emerald-600"
                      title={session.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <FaArchive className="text-[9px]" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(session._id, e)}
                      className="p-1 hover:text-red-500"
                      title="Delete"
                    >
                      <FaTrash className="text-[9px]" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0e1712]">
        
        {/* Chat Window header */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-950/25 flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FaRobot className="text-lg animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-extrabold dark:text-white truncate">
              {selectedConversation ? selectedConversation.title : 'AI Operational Copilot'}
            </h2>
            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Prompt Optimization & Security Engine
            </span>
          </div>

          {selectedId && (
            <div className="flex gap-2">
              <button
                onClick={() => handleClearChat(selectedId)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-950/30 hover:bg-red-50 dark:hover:bg-red-950/15 text-red-650 dark:text-red-400 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                title="Clear Message Log"
              >
                Clear Log
              </button>
              <button
                onClick={(e) => handleDeleteChat(selectedId, e)}
                className="flex items-center justify-center p-2 border border-gray-200 dark:border-emerald-950/45 hover:bg-red-50 dark:hover:bg-red-950/15 text-gray-500 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                title="Delete Chat Session"
              >
                <FaTrash className="text-[10px]" />
              </button>
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-50/20 dark:bg-[#080d0a]/20">
          {!selectedConversation || !selectedConversation.messages || selectedConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <FaRobot className="text-3xl animate-bounce" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white mb-1.5">No Messages Yet</h3>
              <p className="text-xs text-gray-400 font-semibold max-w-sm mb-6 leading-relaxed">
                Start typing below or select a preset operational analysis. The Prompt Engine will convert your request dynamically.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => handleSendMessage(p.text, p.serviceOverride)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#0e1712] border border-gray-200 dark:border-emerald-950/40 rounded-xl text-gray-650 dark:text-emerald-350 hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all cursor-pointer shadow-sm"
                  >
                    {p.text} <FaArrowRight className="text-[9px]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            selectedConversation.messages.map((msg, idx) => {
              const isAI = msg.sender === 'assistant';
              return (
                <div
                  key={msg._id || idx}
                  className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/20">
                      <FaRobot className="text-sm" />
                    </div>
                  )}
                  
                  <div className="space-y-1 group">
                    <div className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isAI
                        ? 'bg-white dark:bg-[#0e1712] border border-gray-100 dark:border-emerald-950/30 text-gray-800 dark:text-gray-100'
                        : 'bg-emerald-600 text-white font-semibold'
                    }`}>
                      {isAI ? (
                        <div>
                          {msg.aiResponse.split('\n').map((line, lIdx) => {
                            if (line.startsWith('* ')) {
                              return <li key={lIdx} className="ml-4 list-disc my-0.5">{line.substring(2)}</li>;
                            }
                            if (line.startsWith('|')) {
                              return <div key={lIdx} className="font-mono text-[10px] leading-normal">{line}</div>;
                            }
                            return <p key={lIdx} className={line === '' ? 'h-2' : 'my-1'}>{line}</p>;
                          })}
                        </div>
                      ) : (
                        <p>{msg.originalQuestion}</p>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-3 text-[9px] text-gray-400 font-semibold px-1 ${!isAI ? 'justify-end' : 'justify-between'}`}>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {isAI && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleCopyText(msg.aiResponse)}
                            className="hover:text-emerald-500 flex items-center gap-1.5"
                            title="Copy Response"
                          >
                            <FaCopy className="text-[10px]" /> Copy
                          </button>
                          
                          <div className="flex gap-1.5 items-center pl-1 border-l border-gray-200 dark:border-emerald-950/40">
                            <button
                              onClick={() => handleFeedback(selectedId, 'Like')}
                              className={`hover:text-emerald-600 ${selectedConversation?.feedback === 'Like' ? 'text-emerald-605' : ''}`}
                              title="Like"
                            >
                              <FaThumbsUp />
                            </button>
                            <button
                              onClick={() => handleFeedback(selectedId, 'Dislike')}
                              className={`hover:text-red-500 ${selectedConversation?.feedback === 'Dislike' ? 'text-red-500' : ''}`}
                              title="Dislike"
                            >
                              <FaThumbsDown />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

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
            placeholder={selectedId ? "Ask AI Copilot about fuel, alerts, or machine logs..." : "Start a conversation to chat..."}
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
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shrink-0 flex items-center justify-center cursor-pointer"
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
