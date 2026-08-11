import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  User as UserIcon, 
  Box, 
  ShieldAlert, 
  Wrench, 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Mic, 
  RefreshCw,
  Search,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { 
  Asset, 
  WarrantyRecord, 
  RepairRecord, 
  Employee, 
  Department 
} from '../types';
import { 
  ChatMessage, 
  queryAssetPulseAI, 
  StructuredData 
} from '../services/aiService';

interface AIAssistantViewProps {
  assets: Asset[];
  warranties: WarrantyRecord[];
  repairs: RepairRecord[];
  employees: Employee[];
  departments: Department[];
  onOpenAssetDetail?: (asset: Asset) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  assets,
  warranties,
  repairs,
  employees,
  departments,
  onOpenAssetDetail
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: "Hello! I am **AssetPulse Copilot**, your real-time natural language asset intelligence assistant. I can track down equipment locations, inspect warranty expirations, list active repair work orders, and analyze employee custody.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        "Where is AST-2026-001?",
        "Who is using this laptop?",
        "Which warranties expire this month?",
        "Show assets under repair."
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: userTimestamp
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await queryAssetPulseAI(text, {
        assets,
        warranties,
        repairs,
        employees,
        departments
      });
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I encountered a transient error querying the asset database. Please try your request again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome_1',
        sender: 'assistant',
        text: "Conversation cleared. How can I assist you with your equipment inventory today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          "Where is AST-2026-001?",
          "Who is using this laptop?",
          "Which warranties expire this month?",
          "Show assets under repair."
        ]
      }
    ]);
  };

  // Helper renderer for simple bold formatting
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Render Structured Data Cards
  const renderStructuredData = (data: StructuredData) => {
    if (data.type === 'assets' && data.assets && data.assets.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {data.title && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5" />
              <span>{data.title}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.assets.map((asset) => (
              <div 
                key={asset.id} 
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 hover:border-blue-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {asset.tag}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === 'In Use' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      asset.status === 'Available' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 line-clamp-1">
                    {asset.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                    <div>Location: <strong className="text-slate-700 dark:text-slate-300">{asset.location}</strong></div>
                    <div>Assigned: <strong className="text-slate-700 dark:text-slate-300">{asset.assignedEmployeeName || 'Unassigned'}</strong></div>
                  </div>
                </div>

                {onOpenAssetDetail && (
                  <button
                    onClick={() => onOpenAssetDetail(asset)}
                    className="w-full mt-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all cursor-pointer"
                  >
                    <span>Inspect Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'warranties' && data.warranties && data.warranties.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {data.title && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{data.title}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.warranties.map((w) => (
              <div key={w.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{w.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    w.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    w.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {w.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{w.assetName}</h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provider: <strong className="text-slate-700 dark:text-slate-300">{w.vendorName}</strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Expires: <strong className="text-slate-700 dark:text-slate-300 font-mono">{w.expiryDate}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'repairs' && data.repairs && data.repairs.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {data.title && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>{data.title}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.repairs.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-600">{r.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {r.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.assetName}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{r.issueDescription}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Vendor: <strong className="text-slate-700 dark:text-slate-300">{r.vendorName}</strong></span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">${(r.repairCost || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'summary' && data.stats) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {data.stats.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{s.label}</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white font-mono">
                AssetPulse AI Copilot
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active & Context-Aware</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Query hardware repositories, locations, warranty alerts & tickets using natural language.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Suggested:</span>
        </span>
        {[
          "Where is AST-2026-001?",
          "Who is using this laptop?",
          "Which warranties expire this month?",
          "Show assets under repair."
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`p-2 rounded-xl text-white shrink-0 shadow-xs ${
              msg.sender === 'user' 
                ? 'bg-blue-600' 
                : 'bg-indigo-600'
            }`}>
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Container */}
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white font-medium rounded-tr-xs'
                : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-2xs'
            }`}>
              {/* Header inside bubble */}
              <div className={`flex items-center justify-between gap-4 pb-1 mb-1 border-b text-[10px] ${
                msg.sender === 'user'
                  ? 'border-blue-500/50 text-blue-100'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AssetPulse AI'}</span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Message Text */}
              <div className="whitespace-pre-line">
                {renderFormattedText(msg.text)}
              </div>

              {/* Structured Output Cards */}
              {msg.structuredData && renderStructuredData(msg.structuredData)}

              {/* Follow-up Pills */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Next Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{f}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Analyzing Asset Database...</span>
                <span className="text-[10px] text-slate-400">Scanning equipment tags, warranties, and repair work tickets</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Where is AST-2026-001?' or 'Which warranties expire this month?')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="button"
              title="Voice Input (Simulated)"
              className="absolute right-3 top-3 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
