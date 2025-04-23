import { useState, useEffect, useRef } from 'react';
import { useWebSocketContext, CollaboratorInfo } from '../../hooks/use-websocket-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Users, Activity, Zap } from 'lucide-react';

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface LinkData {
  source: string;
  target: string;
  strength: number;
  lastActive: string;
}

export function NetworkVisualization() {
  const { collaborators, events, isConnected } = useWebSocketContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Map<string, NodePosition>>(new Map());
  const [links, setLinks] = useState<LinkData[]>([]);
  const animationRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  
  // Create and update node positions based on collaborators
  useEffect(() => {
    // Initialize nodes for each collaborator
    const updatedNodes = new Map(nodes);
    
    // Add new collaborators as nodes
    collaborators.forEach(collab => {
      if (!updatedNodes.has(collab.userId)) {
        // Random position within canvas
        updatedNodes.set(collab.userId, {
          x: Math.random() * 800,
          y: Math.random() * 400,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        });
      }
    });
    
    // Remove nodes that are no longer in collaborators
    Array.from(updatedNodes.keys()).forEach(nodeId => {
      if (!collaborators.some(c => c.userId === nodeId)) {
        updatedNodes.delete(nodeId);
      }
    });
    
    setNodes(updatedNodes);
  }, [collaborators]);
  
  // Create links between collaborators based on interactions
  useEffect(() => {
    if (events.length === 0 || collaborators.length < 2) return;
    
    // Map to track interactions between users
    const interactionMap = new Map<string, Map<string, number>>();
    
    // Process events to build interaction strengths
    events.forEach(event => {
      // Skip self-interactions
      if (event.type === 'message' || event.type === 'action') {
        const sourceId = event.user.id;
        
        // Add interactions with all other collaborators
        collaborators.forEach(collab => {
          const targetId = collab.userId;
          if (sourceId !== targetId) {
            // Get or initialize interaction map for source
            if (!interactionMap.has(sourceId)) {
              interactionMap.set(sourceId, new Map<string, number>());
            }
            
            const sourceMap = interactionMap.get(sourceId)!;
            const currentStrength = sourceMap.get(targetId) || 0;
            sourceMap.set(targetId, currentStrength + 1);
          }
        });
      }
    });
    
    // Convert interaction map to links
    const newLinks: LinkData[] = [];
    interactionMap.forEach((targets, source) => {
      targets.forEach((strength, target) => {
        // Only add links if both nodes exist and strength is significant
        if (nodes.has(source) && nodes.has(target) && strength > 0) {
          newLinks.push({
            source,
            target,
            strength: Math.min(1, strength / 10), // Normalize strength 
            lastActive: new Date().toISOString()
          });
        }
      });
    });
    
    // Add default links for all collaborators if no interactions exist
    if (newLinks.length === 0 && collaborators.length > 1) {
      // Create a circle of connections
      for (let i = 0; i < collaborators.length; i++) {
        const sourceId = collaborators[i].userId;
        const targetId = collaborators[(i + 1) % collaborators.length].userId;
        
        if (sourceId !== targetId) {
          newLinks.push({
            source: sourceId,
            target: targetId,
            strength: 0.3, // Default weak strength
            lastActive: new Date().toISOString()
          });
        }
      }
    }
    
    setLinks(newLinks);
  }, [events, collaborators, nodes]);
  
  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || collaborators.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Animation and physics simulation
    const animate = (timestamp: number) => {
      // Calculate delta time for smooth animation
      const deltaTime = timestamp - (lastRenderTimeRef.current || timestamp);
      lastRenderTimeRef.current = timestamp;
      const normalizedDelta = Math.min(deltaTime / 16.667, 2); // Normalize to 60fps
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply forces and update positions
      const updatedNodes = new Map(nodes);
      
      // Apply forces between nodes (simple repulsion)
      Array.from(updatedNodes.entries()).forEach(([id1, node1]) => {
        Array.from(updatedNodes.entries()).forEach(([id2, node2]) => {
          if (id1 !== id2) {
            // Calculate distance
            const dx = node2.x - node1.x;
            const dy = node2.y - node1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 200) {
              // Repulsive force (inverse square)
              const force = 200 / (distance * distance);
              const forceX = dx / distance * force;
              const forceY = dy / distance * force;
              
              // Apply force (repulsion)
              node1.vx -= forceX * 0.01 * normalizedDelta;
              node1.vy -= forceY * 0.01 * normalizedDelta;
              node2.vx += forceX * 0.01 * normalizedDelta;
              node2.vy += forceY * 0.01 * normalizedDelta;
            }
          }
        });
      });
      
      // Apply link forces (attraction)
      links.forEach(link => {
        const sourceNode = updatedNodes.get(link.source);
        const targetNode = updatedNodes.get(link.target);
        
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Attractive force (linear with distance)
            const force = distance * 0.005 * link.strength;
            const forceX = dx / distance * force;
            const forceY = dy / distance * force;
            
            // Apply force (attraction)
            sourceNode.vx += forceX * normalizedDelta;
            sourceNode.vy += forceY * normalizedDelta;
            targetNode.vx -= forceX * normalizedDelta;
            targetNode.vy -= forceY * normalizedDelta;
          }
        }
      });
      
      // Update positions and apply damping
      updatedNodes.forEach((node, id) => {
        // Apply damping
        node.vx *= 0.95;
        node.vy *= 0.95;
        
        // Update position
        node.x += node.vx * normalizedDelta;
        node.y += node.vy * normalizedDelta;
        
        // Contain within bounds with bouncing
        const nodeRadius = 20;
        if (node.x < nodeRadius) {
          node.x = nodeRadius;
          node.vx = Math.abs(node.vx) * 0.5;
        } else if (node.x > canvas.width - nodeRadius) {
          node.x = canvas.width - nodeRadius;
          node.vx = -Math.abs(node.vx) * 0.5;
        }
        
        if (node.y < nodeRadius) {
          node.y = nodeRadius;
          node.vy = Math.abs(node.vy) * 0.5;
        } else if (node.y > canvas.height - nodeRadius) {
          node.y = canvas.height - nodeRadius;
          node.vy = -Math.abs(node.vy) * 0.5;
        }
      });
      
      // Draw links
      ctx.lineWidth = 1;
      links.forEach(link => {
        const sourceNode = updatedNodes.get(link.source);
        const targetNode = updatedNodes.get(link.target);
        
        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          // Gradient based on link strength
          const alpha = 0.1 + link.strength * 0.4;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.stroke();
        }
      });
      
      // Draw nodes
      collaborators.forEach(collab => {
        const node = updatedNodes.get(collab.userId);
        if (node) {
          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
          ctx.stroke();
          
          // Draw avatar placeholder or initial
          ctx.beginPath();
          ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
          ctx.fill();
          
          // Draw initials
          const initials = collab.userName
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase();
            
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, node.x, node.y);
          
          // Draw name label below
          ctx.font = '12px sans-serif';
          ctx.fillStyle = 'black';
          ctx.fillText(collab.userName, node.x, node.y + 35);
        }
      });
      
      // Update nodes state if positions changed significantly
      setNodes(updatedNodes);
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, links, collaborators]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Users className="h-4 w-4" /> Collaboration Network
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Users className="h-3 w-3" />
            {collaborators.length} Users
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Activity className="h-3 w-3" />
            {links.length} Connections
          </Badge>
        </div>
      </div>
      
      <div className="relative aspect-video w-full border rounded-md overflow-hidden bg-muted/30">
        {isConnected && collaborators.length > 0 ? (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <Activity className="h-8 w-8 mb-2 text-muted-foreground/60" />
            <p className="text-muted-foreground">
              {isConnected 
                ? 'Waiting for collaborators to join...' 
                : 'Connect to the WebSocket to see the collaboration network'}
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-indigo-400"></div>
          <span>Nodes represent team members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-8 bg-indigo-400/30 rounded"></div>
          <span>Links show collaboration intensity</span>
        </div>
      </div>
    </div>
  );
}