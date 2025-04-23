import { useState, useEffect, useRef } from 'react';
import { useWebSocketContext } from '../../hooks/use-websocket-context';
import { Button } from '../ui/button';
import { Eraser, Pencil, RotateCcw, Square, Circle, MousePointer2, Type, Download } from 'lucide-react';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'draw' | 'erase';
}

interface StrokeData {
  userId: string;
  userName: string;
  points: DrawingPoint[];
  tool: 'pencil' | 'eraser' | 'square' | 'circle' | 'text';
  color: string;
  size: number;
  id: string;
  timestamp: string;
}

interface WhiteboardDataState {
  strokes: StrokeData[];
  texts: {
    id: string;
    userId: string;
    userName: string;
    x: number;
    y: number;
    text: string;
    color: string;
    timestamp: string;
  }[];
}

export function SharedWhiteboard() {
  const { isConnected, userInfo, sendCollaborationEvent, events } = useWebSocketContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardDataState>({
    strokes: [],
    texts: []
  });
  const [selectedTool, setSelectedTool] = useState<'pencil' | 'eraser' | 'square' | 'circle' | 'text'>('pencil');
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // blue
  const [strokeSize, setStrokeSize] = useState(3);
  const [inputText, setInputText] = useState('');
  const [textPosition, setTextPosition] = useState<{x: number, y: number} | null>(null);
  
  // Create a unique ID for strokes
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
  };
  
  // Process drawing events from other users
  useEffect(() => {
    // Filter only whiteboard events
    const whiteboardEvents = events.filter(event => 
      event.type === 'whiteboard' && 
      event.user.id !== userInfo.userId // Skip our own events
    );
    
    if (whiteboardEvents.length > 0) {
      whiteboardEvents.forEach(event => {
        try {
          if (event.details) {
            const details = JSON.parse(event.details);
            
            if (details.action === 'stroke' && details.data) {
              // Add stroke from another user
              setWhiteboardData(prev => ({
                ...prev,
                strokes: [...prev.strokes, {
                  ...details.data,
                  userId: event.user.id,
                  userName: event.user.name,
                  timestamp: event.timestamp
                }]
              }));
            } else if (details.action === 'text' && details.data) {
              // Add text from another user
              setWhiteboardData(prev => ({
                ...prev,
                texts: [...prev.texts, {
                  ...details.data,
                  userId: event.user.id,
                  userName: event.user.name,
                  timestamp: event.timestamp
                }]
              }));
            } else if (details.action === 'clear') {
              // Clear whiteboard
              setWhiteboardData({
                strokes: [],
                texts: []
              });
            }
          }
        } catch (error) {
          console.error('Error processing whiteboard event:', error);
        }
      });
    }
  }, [events, userInfo.userId]);
  
  // Draw the whiteboard content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all strokes
    whiteboardData.strokes.forEach(stroke => {
      if (stroke.tool === 'pencil' || stroke.tool === 'eraser') {
        if (stroke.points.length < 2) return;
        
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
        ctx.lineWidth = stroke.size;
        
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        
        ctx.stroke();
      } else if (stroke.tool === 'square' && stroke.points.length >= 2) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.beginPath();
        ctx.rect(
          start.x, 
          start.y, 
          end.x - start.x, 
          end.y - start.y
        );
        ctx.stroke();
      } else if (stroke.tool === 'circle' && stroke.points.length >= 2) {
        const start = stroke.points[0];
        const end = stroke.points[stroke.points.length - 1];
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Draw all text
    whiteboardData.texts.forEach(textItem => {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = textItem.color;
      ctx.fillText(textItem.text, textItem.x, textItem.y);
    });
    
    // Draw current stroke if drawing
    if (drawing && currentStroke.length > 0) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = selectedTool === 'eraser' ? '#ffffff' : selectedColor;
      ctx.lineWidth = strokeSize;
      
      if (selectedTool === 'pencil' || selectedTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
        
        for (let i = 1; i < currentStroke.length; i++) {
          ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
        }
        
        ctx.stroke();
      } else if (selectedTool === 'square' && currentStroke.length >= 2) {
        const start = currentStroke[0];
        const end = currentStroke[currentStroke.length - 1];
        
        ctx.beginPath();
        ctx.rect(
          start.x, 
          start.y, 
          end.x - start.x, 
          end.y - start.y
        );
        ctx.stroke();
      } else if (selectedTool === 'circle' && currentStroke.length >= 2) {
        const start = currentStroke[0];
        const end = currentStroke[currentStroke.length - 1];
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Show text input position
    if (selectedTool === 'text' && textPosition) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(textPosition.x - 5, textPosition.y - 20, 10, 25);
    }
  }, [whiteboardData, drawing, currentStroke, selectedTool, selectedColor, strokeSize, textPosition]);
  
  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Redraw canvas after resize
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isConnected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'text') {
      // Set position for text input
      setTextPosition({ x, y });
      return;
    }
    
    setDrawing(true);
    setCurrentStroke([{
      x,
      y,
      color: selectedColor,
      size: strokeSize,
      type: selectedTool === 'eraser' ? 'erase' : 'draw'
    }]);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !isConnected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentStroke(prev => [...prev, {
      x,
      y,
      color: selectedColor,
      size: strokeSize,
      type: selectedTool === 'eraser' ? 'erase' : 'draw'
    }]);
  };
  
  const handleMouseUp = () => {
    if (!drawing || !isConnected) return;
    
    // Add current stroke to whiteboard data
    if (currentStroke.length > 0) {
      const newStroke: StrokeData = {
        userId: userInfo.userId,
        userName: userInfo.userName,
        points: currentStroke,
        tool: selectedTool,
        color: selectedColor,
        size: strokeSize,
        id: generateId(),
        timestamp: new Date().toISOString()
      };
      
      setWhiteboardData(prev => ({
        ...prev,
        strokes: [...prev.strokes, newStroke]
      }));
      
      // Send stroke to other collaborators
      sendCollaborationEvent(
        'whiteboard',
        'stroke',
        'whiteboard',
        JSON.stringify({
          action: 'stroke',
          data: newStroke
        })
      );
    }
    
    setDrawing(false);
    setCurrentStroke([]);
  };
  
  // Handle text input submission
  const handleTextSubmit = () => {
    if (!textPosition || !inputText.trim() || !isConnected) return;
    
    const newText = {
      id: generateId(),
      x: textPosition.x,
      y: textPosition.y,
      text: inputText,
      color: selectedColor,
      timestamp: new Date().toISOString()
    };
    
    setWhiteboardData(prev => ({
      ...prev,
      texts: [...prev.texts, {
        ...newText,
        userId: userInfo.userId,
        userName: userInfo.userName
      }]
    }));
    
    // Send text to other collaborators
    sendCollaborationEvent(
      'whiteboard',
      'text',
      'whiteboard',
      JSON.stringify({
        action: 'text',
        data: newText
      })
    );
    
    // Reset text input
    setInputText('');
    setTextPosition(null);
  };
  
  // Clear whiteboard
  const handleClear = () => {
    setWhiteboardData({
      strokes: [],
      texts: []
    });
    
    // Send clear action to other collaborators
    sendCollaborationEvent(
      'whiteboard',
      'clear',
      'whiteboard',
      JSON.stringify({
        action: 'clear'
      })
    );
  };
  
  // Export whiteboard as PNG
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = 'whiteboard-export.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Define color options
  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#000000', label: 'Black' }
  ];
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTool === 'pencil' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('pencil')}
            title="Pencil"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'square' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('square')}
            title="Square"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('circle')}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedTool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTool('text')}
            title="Text"
          >
            <Type className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-8 bg-border mx-1"></div>
          
          {colorOptions.map(color => (
            <Button
              key={color.value}
              variant="outline"
              size="sm"
              className={`p-0 w-8 h-8 rounded-full ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.value)}
              title={color.label}
            />
          ))}
          
          <div className="w-px h-8 bg-border mx-1"></div>
          
          <select
            className="h-8 rounded-md border border-input bg-background text-sm"
            value={strokeSize}
            onChange={(e) => setStrokeSize(Number(e.target.value))}
            title="Stroke Width"
          >
            <option value={1}>1px</option>
            <option value={3}>3px</option>
            <option value={5}>5px</option>
            <option value={8}>8px</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            title="Clear Whiteboard"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export as PNG"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Text input field */}
      {selectedTool === 'text' && textPosition && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text to add..."
            className="flex-1 p-2 border rounded-md"
            autoFocus
          />
          <Button 
            onClick={handleTextSubmit}
            size="sm"
          >
            Add Text
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setTextPosition(null)}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {/* Canvas */}
      <div className="relative border rounded-md overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full aspect-video cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <p className="text-muted-foreground">
              Connect to the WebSocket to use the whiteboard
            </p>
          </div>
        )}
      </div>
      
      {/* Collaborator info */}
      <div className="text-xs text-muted-foreground">
        <p>
          {whiteboardData.strokes.length > 0 || whiteboardData.texts.length > 0
            ? `${whiteboardData.strokes.length} drawings, ${whiteboardData.texts.length} text elements`
            : 'Start drawing to collaborate with your team'}
        </p>
      </div>
    </div>
  );
}