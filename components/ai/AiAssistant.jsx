"use client";
import { useTeamContext } from "@/context/TeamProvider";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function AiAssistant({ imageUrl }) {
  const { orgId } = useTeamContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create user message with optional image
    const userMessage = {
      role: "user",
      content: input,
      imageUrl: imageUrl // Always include imageUrl (can be undefined)
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/org/${orgId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      console.log("data from server:", data);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.aiResponse },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-primary/50 opacity-50 backdrop-blur-3xl text-white rounded-full p-4 shadow-lg transition"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-card shadow-lg rounded-lg flex flex-col overflow-hidden border max-h-[70vh]">
          <div className="bg-card p-3 font-semibold">AI Assistant</div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 items-start ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`p-2 rounded-lg max-w-[80%] break-words whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={m.imageUrl} />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-gray-400">Assistant is typing...</div>
            )}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} size="sm">
              Send
            </Button>
          </div>
        </div>
      )}
    </>
  );
}