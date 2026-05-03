"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { MessageCircle, X, Send, Loader2, Sparkles, User, Trash2, Zap, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatWithAI, getChatHistory, clearChatHistory, getModels, AIModelStatus } from "@/services/ai.service";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

const BotLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Solid Red Modern Chat Bubble */}
    <rect x="10" y="15" width="80" height="60" rx="30" fill="#e11d48" className="fill-primary" />
    <path d="M 75,65 L 85,85 L 60,73 Z" fill="#e11d48" className="fill-primary" />
    
    {/* AI Sparkles / Stars (White) inside */}
    <path d="M 42,28 Q 42,45 25,45 Q 42,45 42,62 Q 42,45 59,45 Q 42,45 42,28 Z" fill="white" />
    <path d="M 65,22 Q 65,32 55,32 Q 65,32 65,42 Q 65,32 75,32 Q 65,32 65,22 Z" fill="white" opacity="0.9" />
  </svg>
);

export default function ChatWidget() {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [models, setModels] = useState<AIModelStatus[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history & models when chat opens for the first time
  useEffect(() => {
    if (isOpen && user) {
      if (messages.length === 0) loadHistory();
      fetchModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      setIsFetchingHistory(true);
      const history = await getChatHistory();
      if (history && history.length > 0) {
        setMessages(history.map(h => ({ id: h.id, role: h.role as "user"|"model", content: h.content })));
      } else {
        // Initial greeting
        setMessages([{
          id: "initial-msg",
          role: "model",
          content: `হ্যালো! আমি ${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'}${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'}-এর AI সহকারী। রক্তদান, ডোনার খোঁজা বা পোস্ট করা সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।`
        }]);
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([{
        id: "initial-msg",
        role: "model",
        content: "আপনার পূর্বের চ্যাটের ইতিহাস মুছে ফেলা হয়েছে। আমি কীভাবে আপনাকে সাহায্য করতে পারি?"
      }]);
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    
    const userMsg = input.trim();
    setInput("");
    
    // Optimistic UI update
    const tempId = Date.now().toString();
    const newMessages: Message[] = [...messages, { id: tempId, role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatWithAI(
        userMsg,
        messages.map(m => ({ role: m.role, content: m.content })),
        selectedModel
      );
      
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: "model", content: response }]);
    } catch (error: any) {
      fetchModels(); // Update model statuses after failure

      const errorMsg = error.response?.status === 429 || error.response?.status === 503
        ? "সব এআই মডেলের কোটা শেষ বা তারা সাময়িকভাবে বন্ধ আছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
        : (error.response?.data?.message || "দুঃখিত, কোনো সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      
      // Keep optimistic user message and show error below it
      setMessages([...newMessages, { 
        id: (Date.now() + 1).toString(), 
        role: "model", 
        content: errorMsg 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "Find O+ Donors", icon: Search, query: "Dhaka-তে O+ ডোনার আছে?" },
    { label: "How to Donate?", icon: Zap, query: "রক্তদানের নিয়মগুলো কী কী?" },
    { label: "Platform Info", icon: Info, query: "এই প্ল্যাটফর্মটি কীভাবে কাজ করে?" },
  ];

  // Only show widget if user is logged in
  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] active:scale-95 transition-all duration-300 group flex items-center justify-center border border-gray-100"
          aria-label="Open AI Chat"
        >
          <BotLogo className="w-9 h-9 transition-transform duration-500 group-hover:rotate-12" />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          <span className="absolute right-full mr-4 bg-foreground text-background px-3 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl">
            BloodHelp AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-20 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary/95 backdrop-blur-md text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-1.5 bg-white rounded-xl shadow-inner ring-1 ring-black/5 flex items-center justify-center">
                <BotLogo className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold tracking-tight leading-none mb-1.5">
                  BloodHelp <span className="text-[10px] font-black bg-white text-primary px-1.5 py-0.5 rounded ml-1">AI</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Active Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white hover:bg-white/10" onClick={handleClearHistory} title="Clear conversation">
                <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Model Selector Bar */}
          <div className="bg-primary/5 border-b px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              AI Engine
            </span>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-background text-xs font-semibold border border-primary/20 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer shadow-sm min-w-[150px]"
            >
              {models.map(m => (
                <option key={m.id} value={m.id} className="font-medium">
                  {m.status === 'active' ? '🟢' : '🔴'} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-muted/30 to-background scroll-smooth">
            {isFetchingHistory ? (
              <div className="flex flex-col justify-center items-center h-full gap-3 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-medium tracking-tight">Syncing history...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Welcome Message or Quick Actions if empty */}
                {messages.length <= 1 && (
                  <div className="flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-1">Quick Actions</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInput(action.query);
                            // Auto-send could be added here
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-background border border-primary/10 rounded-xl text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
                        >
                          <action.icon className="w-3 h-3 text-primary" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-110 ${msg.role === "user" ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-white dark:bg-muted text-primary border border-primary/10 shadow-black/5"}`}>
                      {msg.role === "user" ? <User className="w-4.5 h-4.5" /> : <BotLogo className="w-5 h-5" />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20 font-medium" : "bg-white dark:bg-card border border-primary/5 rounded-tl-none shadow-black/5"}`}>
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-primary">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto animate-in fade-in duration-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-muted text-primary border border-primary/10 shadow-sm">
                      <BotLogo className="w-5 h-5" />
                    </div>
                    <div className="p-4 bg-white dark:bg-card border border-primary/5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '200ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '400ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background/50 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  placeholder="Ask anything about blood..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || isFetchingHistory}
                  className="w-full h-12 pl-5 pr-12 bg-muted/30 border border-primary/5 rounded-2xl text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all disabled:opacity-50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center opacity-30 group-focus-within:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold border rounded px-1.5 py-0.5 bg-muted">ENTER</span>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isFetchingHistory}
                className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
              >
                <Send className="w-4.5 h-4.5 ml-0.5" />
              </Button>
            </div>
            <div className="text-[9px] text-center text-muted-foreground/60 mt-3 px-4 font-medium uppercase tracking-wider">
              Powered by Google Gemini Flash
            </div>
          </div>
        </div>
      )}
    </>
  );
}
