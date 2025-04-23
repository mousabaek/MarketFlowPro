import { useState, useEffect, useRef } from 'react';
import { useWebSocketContext, CollaborationEvent } from '../../hooks/use-websocket-context';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, Send, Info, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export function ChatPanel() {
  const { isConnected, events, userInfo, sendCollaborationEvent, collaborators } = useWebSocketContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Process chat messages from events
  useEffect(() => {
    // Filter only message events
    const messageEvents = events.filter(event => event.type === 'message');
    
    if (messageEvents.length > 0) {
      // Convert events to chat messages
      const newMessages = messageEvents
        .filter(event => !messages.some(m => m.id === event.id)) // Filter out duplicates
        .map(event => ({
          id: event.id,
          userId: event.user.id,
          userName: event.user.name,
          avatar: event.user.avatar,
          message: event.details || '',
          timestamp: event.timestamp,
          isSystem: false
        }));
      
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
    }
    
    // Also add system messages for join/leave events
    const joinLeaveEvents = events.filter(event => 
      (event.type === 'join' || event.type === 'leave') && 
      !messages.some(m => m.id === event.id) // Filter out duplicates
    );
    
    if (joinLeaveEvents.length > 0) {
      // Convert to system messages
      const systemMessages = joinLeaveEvents.map(event => ({
        id: event.id,
        userId: event.user.id,
        userName: event.user.name,
        avatar: event.user.avatar,
        message: event.type === 'join' 
          ? `${event.user.name} joined the collaboration.` 
          : `${event.user.name} left the collaboration.`,
        timestamp: event.timestamp,
        isSystem: true
      }));
      
      setMessages(prev => [...prev, ...systemMessages]);
    }
  }, [events, messages]);
  
  // Send a chat message
  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    // Generate a unique ID for the message
    const messageId = Math.random().toString(36).substring(2, 15);
    
    // Send message event
    sendCollaborationEvent(
      'message',
      'chat',
      'all',
      inputMessage.trim()
    );
    
    // Add message locally
    const newMessage: ChatMessage = {
      id: messageId,
      userId: userInfo.userId,
      userName: userInfo.userName,
      avatar: userInfo.avatar,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };
  
  // Handle input keypress (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  // Format date for message groups
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return '';
    }
  };
  
  // Group messages by date
  const messagesByDate = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 mb-2 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <h3 className="text-sm font-medium">Team Chat</h3>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground">
            {collaborators.length} {collaborators.length === 1 ? 'user' : 'users'} online
          </span>
        </div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 pr-4">
          {Object.entries(messagesByDate).map(([date, messagesInDay]) => (
            <div key={date}>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    {date}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {messagesInDay.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.isSystem ? 'justify-center' : 'gap-3'}`}
                  >
                    {!message.isSystem && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback>
                          {message.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1">
                      {!message.isSystem && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={message.isSystem 
                        ? "text-xs text-muted-foreground flex items-center justify-center gap-1.5"
                        : "text-sm mt-1"
                      }>
                        {message.isSystem && (
                          message.message.includes('joined') 
                            ? <Info className="h-3 w-3" /> 
                            : <AlertTriangle className="h-3 w-3" />
                        )}
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="mt-4 flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Connect to send messages..."}
          onKeyDown={handleKeyPress}
          disabled={!isConnected}
          className="flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={!isConnected || !inputMessage.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}