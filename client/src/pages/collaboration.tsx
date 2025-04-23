import { useEffect } from 'react';
import CollaborationSpace from '../components/collaboration-space';
import CursorTracker from '../components/collaboration/cursor-tracker';
import PresenceIndicator from '../components/collaboration/presence-indicator';
import ActivityFeed from '../components/collaboration/activity-feed';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useWebSocketContext } from '../hooks/use-websocket-context';

export default function CollaborationPage() {
  const { sendMessage, isConnected } = useWebSocketContext();
  
  // Send a test event when the page loads
  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        sendMessage({
          type: 'activity',
          activityType: 'page_view',
          user: {
            id: (window as any)._currentUserId,
            name: 'Test User'
          },
          message: 'Viewed the collaboration test page',
          target: 'collaboration.tsx',
          timestamp: new Date().toISOString()
        });
      }, 1000);
    }
  }, [isConnected, sendMessage]);
  
  // Function to send a test event
  const sendTestEvent = (type: string) => {
    sendMessage({
      type: 'activity',
      activityType: type,
      action: `Test ${type} action`,
      user: {
        id: (window as any)._currentUserId,
        name: 'Test User'
      },
      target: `test_${type}`,
      details: `This is a test ${type} event sent at ${new Date().toLocaleTimeString()}`
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Real-Time Collaboration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Collaboration Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Send test events to see them in the activity feed
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  onClick={() => sendTestEvent('edit')}
                  disabled={!isConnected}
                >
                  Edit Event
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => sendTestEvent('comment')}
                  disabled={!isConnected}
                >
                  Comment Event
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => sendTestEvent('upload')}
                  disabled={!isConnected}
                >
                  Upload Event
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => sendTestEvent('link')}
                  disabled={!isConnected}
                >
                  Link Event
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid w-full gap-1.5">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  placeholder="Type a message to send to the activity feed"
                  id="message"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  const textarea = document.getElementById('message') as HTMLTextAreaElement;
                  if (textarea.value.trim()) {
                    sendMessage({
                      type: 'message',
                      message: textarea.value,
                      user: {
                        id: (window as any)._currentUserId,
                        name: 'Test User'
                      }
                    });
                    textarea.value = '';
                  }
                }}
                disabled={!isConnected}
              >
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4 h-[300px] overflow-auto">
              <ActivityFeed />
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <PresenceIndicator />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Move your cursor around to see it tracked in real-time for other users</p>
        <p className="mt-1">Open this page in multiple browser windows to test the full collaboration experience</p>
      </div>
      
      {/* This includes both the cursor tracking and the collaboration panel */}
      <CollaborationSpace />
    </div>
  );
}