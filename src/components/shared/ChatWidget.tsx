"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { MessageCircle, X, Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatWithAI, getChatHistory, clearChatHistory } from "@/services/ai.service";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

export default function ChatWidget() {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history when chat opens for the first time
  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

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
        messages.map(m => ({ role: m.role, content: m.content }))
      );
      
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: "model", content: response }]);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      // Revert optimistic update on failure or add an error message
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

  // Only show widget if user is logged in
  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          aria-label="Open AI Chat"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute right-full mr-4 bg-foreground text-background px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-20 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold leading-none mb-1">
                  {process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'}{process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'} AI Assistant
                </h3>
                <p className="text-xs text-primary-foreground/80">Online 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground" onClick={handleClearHistory} title="Clear History">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-muted/20 scroll-smooth">
            {isFetchingHistory ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border rounded-tl-sm shadow-sm"}`}>
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground border">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 bg-background border rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                placeholder="Message AI Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isFetchingHistory}
                className="flex-1 h-11 px-4 py-2 bg-muted/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || isFetchingHistory}
                className="h-11 w-11 rounded-full shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-2 px-4">
              AI may occasionally produce incorrect results. Please verify important information.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
