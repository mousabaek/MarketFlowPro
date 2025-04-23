import { useState, useEffect, useRef } from 'react';
import { RealTimeCollaboration } from '@/components/collaboration/real-time-visualization';
import { CursorTracker } from '@/components/collaboration/cursor-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWebSocketContext } from '../hooks/use-websocket-context';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Save, Check, Share2, UserPlus, Link as LinkIcon } from 'lucide-react';

export default function CollaborationPage() {
  const { toast } = useToast();
  const [userId] = useState(() => localStorage.getItem('collaborationUserId') || uuidv4());
  const [userName, setUserName] = useState(() => 
    localStorage.getItem('collaborationUserName') || `User-${userId.substring(0, 4)}`
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Collaborative Project Plan');
  const [documentContent, setDocumentContent] = useState(
    'This is a collaborative document. Multiple users can edit this content simultaneously.\n\n' +
    '# Project Goals\n\n' +
    '- Define project scope\n' +
    '- Assign team responsibilities\n' +
    '- Set up timeline and milestones\n\n' +
    '# Next Steps\n\n' +
    '- Research competitors\n' +
    '- Develop prototype\n' +
    '- Gather user feedback'
  );
  
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isConnected } = useWebSocketContext();
  
  // Handle WebSocket events
  useEffect(() => {
    if (isConnected) {
      sendUserAction('opened', 'document', 'Connected to collaborative editing session');
    }
  }, [isConnected]);
  
  // Save user ID to localStorage
  useEffect(() => {
    localStorage.setItem('collaborationUserId', userId);
  }, [userId]);
  
  // Save username to localStorage when changed
  useEffect(() => {
    localStorage.setItem('collaborationUserName', userName);
  }, [userName]);
  
  // Function to save the username
  const saveUserName = () => {
    setIsEditingName(false);
    
    // Notify others about name change
    sendUserAction('updated', 'profile', `Changed display name to "${userName}"`);
    
    toast({
      title: 'Name Updated',
      description: `Your display name is now "${userName}"`,
    });
  };
  
  // Function to send user actions via WebSocket
  const sendUserAction = (action: string, target: string, details?: string) => {
    if (isConnected) {
      sendMessage({
        type: 'user_action',
        action,
        target,
        details,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Function to copy collaboration link
  const copyCollaborationLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    
    toast({
      title: 'Link Copied',
      description: 'Collaboration link copied to clipboard',
    });
  };
  
  // Function to save document content
  const saveDocument = () => {
    sendUserAction('saved', 'document', 'Updated the document content');
    
    toast({
      title: 'Document Saved',
      description: 'Document changes have been saved',
    });
  };
  
  return (
    <div className="space-y-8" ref={pageContainerRef}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Collaboration</h1>
          <p className="text-muted-foreground">
            Work together with your team in real-time
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-40 text-sm"
                  placeholder="Your name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveUserName()}
                />
                <Button size="sm" variant="outline" onClick={saveUserName}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span>Logged in as <strong>{userName}</strong></span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsEditingName(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected to collaboration server' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 items-center" 
              onClick={copyCollaborationLink}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Copy Link
            </Button>
            <Button 
              size="sm" 
              className="flex gap-1 items-center"
              onClick={() => {
                sendUserAction('invited', 'collaborator', 'Invited a new team member');
                toast({
                  title: 'Invitation Sent',
                  description: 'Collaboration invitation has been sent',
                });
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                      onBlur={() => sendUserAction('updated', 'title', `Changed document title to "${documentTitle}"`)}
                    />
                  </div>
                  <CardDescription>
                    Collaborative document editing
                  </CardDescription>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="gap-1"
                  onClick={saveDocument}
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm resize-none"
                onBlur={() => sendUserAction('edited', 'content', 'Made changes to the document')}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Collaboration Options</CardTitle>
              <CardDescription>
                Configure your collaboration preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Share Options</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        sendUserAction('shared', 'document', 'Shared the document with team');
                        toast({
                          title: 'Document Shared',
                          description: 'Document has been shared with your team',
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share with Team
                    </Button>
                    <Button variant="outline">Export Document</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Activity Feed</h3>
                  <div className="rounded-md bg-muted p-4 text-sm">
                    <p className="text-muted-foreground">
                      Activity feed is available in the collaboration panel.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <RealTimeCollaboration />
        </div>
      </div>
      
      {/* Track cursor position if connected */}
      {isConnected && pageContainerRef.current && (
        <CursorTracker
          userId={userId}
          containerRef={pageContainerRef}
          enabled={true}
          throttleMs={100}
        />
      )}
    </div>
  );
}