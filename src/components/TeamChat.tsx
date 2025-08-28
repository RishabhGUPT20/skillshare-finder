import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  user: {
    name: string;
    role: string;
  };
  content: string;
  timestamp: string;
}

interface TeamChatProps {
  teamId: string;
  teamName: string;
}

const TeamChat = ({ teamId, teamName }: TeamChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: { name: 'Rahul Sharma', role: 'owner' },
      content: 'Hey team! Welcome to our project chat. Let\'s discuss our approach for the SIH problem statement.',
      timestamp: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      user: { name: 'Priya Patel', role: 'member' },
      content: 'Hi everyone! I\'ve been researching the tech stack. Should we go with React + Node.js?',
      timestamp: '2024-01-20T10:35:00Z'
    },
    {
      id: '3',
      user: { name: 'Arjun Singh', role: 'member' },
      content: 'That sounds good! I can handle the backend development. When should we start coding?',
      timestamp: '2024-01-20T10:40:00Z'
    },
    {
      id: '4',
      user: { name: 'Sneha Gupta', role: 'member' },
      content: 'I\'ve created a GitHub repo and added everyone as collaborators. Link: github.com/team/sih-project',
      timestamp: '2024-01-20T11:00:00Z'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: { name: 'You', role: 'member' },
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Add a simulated response
      const responses = [
        'Great idea! Let me work on that.',
        'I agree, that approach sounds solid.',
        'Perfect! I\'ll start implementing that feature.',
        'Thanks for sharing! Very helpful.',
        'Let\'s schedule a call to discuss this further.'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        user: { name: 'Team Member', role: 'member' },
        content: randomResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {teamName} - Team Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                
                <div className={`flex gap-3 ${message.user.name === 'You' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {message.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-xs ${message.user.name === 'You' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.user.name}</span>
                      {message.user.role === 'owner' && (
                        <Badge variant="secondary" className="text-xs">Owner</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className={`p-3 rounded-lg text-sm ${
                      message.user.name === 'You' 
                        ? 'bg-primary text-primary-foreground ml-4' 
                        : 'bg-muted mr-4'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamChat;