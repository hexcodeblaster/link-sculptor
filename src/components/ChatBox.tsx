
import React, { useState, useRef } from 'react';
import { MessageSquare, X, Mic, MicOff, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { useConversation } from '@11labs/react';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot'; type: 'text' | 'audio' }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onMessage: (message) => {
      if (message.type === 'final_transcript') {
        // Handle user's speech transcription
        setMessages(prev => [...prev, { 
          text: message.text, 
          sender: 'user', 
          type: 'text' 
        }]);
      } else if (message.type === 'llm_response') {
        // Handle AI's response
        setMessages(prev => [...prev, { 
          text: message.text, 
          sender: 'bot', 
          type: 'text' 
        }]);
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      toast.error('Error in conversation');
    }
  });

  const handleTextSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { text: message, sender: 'user' as const, type: 'text' as const };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.message, sender: 'bot', type: 'text' }]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async () => {
    try {
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with ElevenLabs
      await conversation.startSession({
        agentId: 'YOUR_AGENT_ID_HERE', // Replace with your actual agent ID
      });
      
      toast.success('Connected to voice chat');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start voice chat');
    }
  };

  const stopConversation = async () => {
    try {
      await conversation.endSession();
      toast.success('Voice chat ended');
    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error('Failed to end voice chat');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-80 h-[400px] flex flex-col absolute bottom-0 left-0">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Chat Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSend();
                  }
                }}
              />
              <Button
                onClick={handleTextSend}
                disabled={isLoading || conversation.status === 'connected'}
                className="min-w-[40px]"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={
                  conversation.status === 'connected' 
                    ? stopConversation 
                    : startConversation
                }
                disabled={isLoading}
                variant={conversation.status === 'connected' ? 'destructive' : 'default'}
                className="min-w-[40px]"
              >
                {conversation.status === 'connected' ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatBox;
