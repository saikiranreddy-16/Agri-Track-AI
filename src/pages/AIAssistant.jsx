import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, FaPaperPlane, FaMicrophone, FaPaperclip, 
  FaArrowRight, FaCommentAlt, FaHistory, FaTractor, FaGasPump 
} from 'react-icons/fa';

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
  const messagesEndRef = useRef(null);

  const [activeSession, setActiveSession] = useState('Active Session 1');
  const pastSessions = [
    'Active Session 1',
    'Fuel Analysis Jun 12',
    'Driver Safety Check',
    'Yield Report Sectors'
  ];

  const suggestedPrompts = [
    "Show today's work",
    "Weekly report",
    "Monthly report",
    "Fuel used today",
    "Which machine worked the most?"
  ];

  // Auto-scroll chat log
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const simulateAIResponse = (userPrompt) => {
    setIsTyping(true);
    
    // Choose appropriate mock response based on keyword matching
    let responseText = '';
    const cleanPrompt = userPrompt.toLowerCase();

    setTimeout(() => {
      if (cleanPrompt.includes('work') || cleanPrompt.includes("today's work")) {
        responseText = `Here is the operations summary for today, **July 7, 2026**:
        
* **Total Tilled Area**: 320 Acres across North Wheat & South Corn sectors.
* **Active Vehicles**: 4 tractors actively deploying soil tilling and planting jobs.
* **Operator Hours**: Gurpreet Singh (6.8h), Ramesh Kumar (5.2h), Suresh Patel (7.4h).
* **Completed Tasks**: Pesticide spraying on East Cotton fields is 100% complete.`;
      } else if (cleanPrompt.includes('weekly') || cleanPrompt.includes('week')) {
        responseText = `### Weekly Operational Performance Report (Jun 30 - Jul 06)
        
| Parameter | Recorded Value | Deviation |
| :--- | :--- | :--- |
| **Total Area Covered** | 582 Hectares | +12% vs last week |
| **Active Machinery** | 6 Assets deployed | Constant |
| **Total Fuel Used** | 3180 Litres | Avg 5.4 L/ha |
| **Active Job Hours** | 129 Hours | Nominally safe |

All operations are progressing on schedule. Spraying was temporarily paused on Thursday due to elevated wind speeds (22 km/h).`;
      } else if (cleanPrompt.includes('monthly') || cleanPrompt.includes('month')) {
        responseText = `### Monthly Fleet Efficiency Review (June 2026)
        
* **Harvesting Output**: 2,500 Hectares harvested.
* **Top Asset**: Swaraj 963 FE (155 hours logged, 1,400 Hectares covered).
* **Aggregate Fuel Consumption**: 35,400 Litres.
* **Service Events**: 3 scheduled oil changes completed; 1 hydraulic pressure valve replaced.
* **Safety rating**: Zero critical velocity warnings or boundary overlaps registered.`;
      } else if (cleanPrompt.includes('fuel')) {
        responseText = `**Fuel Consumption Diagnostics (Today)**:
        
* **Aggregate Burned**: 3180 Litres across the fleet.
* **Efficiency Lead**: Ramesh Kumar on *Swaraj 963 FE* (Avg 4.8 L/ha during wheat harvest).
* **High Burn warning**: *Mahindra Novo 755 DI* consumed 360 Litres (Tilling Section 4 clay loam requires elevated power ratios).
* **Critical Tank Alert**: *Sonalika Tiger DI 75* is offline in the yard at **12% fuel capacity**. Needs dispatching a refuel cart.`;
      } else if (cleanPrompt.includes('machine worked') || cleanPrompt.includes('worked the most') || cleanPrompt.includes('tractor')) {
        responseText = `Based on log records, the asset that worked the most today is the **Preet 6049 Super** (mach-6) operated by **Suresh Patel**.
        
* **Shift Duration**: 7.4 Hours active.
* **Task**: Hay Baling in West Barley Meadow.
* **Fuel Burn**: 245 Litres consumed.
* **Area covered**: 22 Hectares completed.
        
*Mahindra Novo 755* is close behind with **6.8 Hours** logged on Soil Tilling.`;
      } else {
        responseText = `I have logged your query regarding: *"${userPrompt}"*. 

In future platform versions, the connected LLM will parse real-time GPS telemetry from Leaflet mappings and sensor logs to solve complex queries. 

For now, try selecting one of our preset quick-prompts below!`;
      }

      setMessages(prev => [
        ...prev,
        { id: `m-ai-${Date.now()}`, sender: 'AI', text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `m-u-${Date.now()}`,
      sender: 'User',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal('');
    simulateAIResponse(text);
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Dynamic Copilot UI Demo
            </span>
          </div>
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
              <div className="w-8 h-8 rounded-lg bg-emerald-150 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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

        {/* Suggested Prompts helper grid */}
        {messages.length === 1 && !isTyping && (
          <div className="p-4 border-t border-gray-100 dark:border-emerald-950/20 bg-gray-50/50 dark:bg-[#080d0a]/20 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">Suggested Prompts</span>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-900/30 rounded-xl text-gray-600 dark:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all cursor-pointer shadow-sm"
                >
                  {p} <FaArrowRight className="text-[9px] text-gray-400" />
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputVal); }}
            placeholder="Ask AI Copilot about fuel, alerts, or machine logs..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 focus:outline-none focus:border-emerald-500 focus:bg-white dark:text-white"
          />

          <button 
            className="p-3 bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-950/40 rounded-xl text-gray-400 hover:text-gray-600 shrink-0"
            title="Voice Commands Placeholder"
          >
            <FaMicrophone />
          </button>

          <button
            onClick={() => handleSend(inputVal)}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shrink-0 flex items-center justify-center"
            title="Send Message"
          >
            <FaPaperPlane className="text-xs" />
          </button>

        </div>

      </div>

    </div>
  );
};
export default AIAssistant;
