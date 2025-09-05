import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface SimpleCell {
  id: number;
  x: number;
  y: number;
  type: string;
  energy: number;
  age: number;
}

interface WorldState {
  step: number;
  width: number;
  height: number;
  cells: SimpleCell[];
}

function SimpleApp() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/ws';
    
    const connect = () => {
      setConnectionStatus('connecting');
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setConnectionStatus('connected');
        console.log('Connected to server');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'world_update') {
          setWorldState(data);
        }
      };
      
      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('Disconnected from server');
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Canvas drawing
  useEffect(() => {
    if (!worldState || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellWidth = canvas.width / worldState.width;
    const cellHeight = canvas.height / worldState.height;
    
    // Draw grid (optional)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= worldState.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= worldState.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(canvas.width, y * cellHeight);
      ctx.stroke();
    }
    
    // Draw cells
    worldState.cells.forEach(cell => {
      const x = cell.x * cellWidth;
      const y = cell.y * cellHeight;
      
      // Color based on type
      let color = '#888';
      switch (cell.type) {
        case 'plant':
          color = `hsl(120, ${cell.energy}%, 50%)`;
          break;
        case 'herbivore':
          color = `hsl(60, ${cell.energy}%, 50%)`;
          break;
        case 'carnivore':
          color = `hsl(0, ${cell.energy}%, 50%)`;
          break;
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
      
      // Energy indicator (small circle)
      const radius = Math.min(cellWidth, cellHeight) * 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${cell.energy / 100})`;
      ctx.beginPath();
      ctx.arc(x + cellWidth/2, y + cellHeight/2, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
    
  }, [worldState]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌌 Cosmic Genesis - Simple 2D</h1>
        
        {/* Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor()
            }}
          />
          <span>{connectionStatus.toUpperCase()}</span>
          {worldState && (
            <>
              <span>|</span>
              <span>Step: {worldState.step}</span>
              <span>|</span>
              <span>Células: {worldState.cells.length}</span>
            </>
          )}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            border: '2px solid #333',
            backgroundColor: '#000011'
          }}
        />

        {/* Legend */}
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          gap: '20px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4CAF50' }}></div>
            <span>Plantas</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#FFEB3B' }}></div>
            <span>Herbívoros</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#F44336' }}></div>
            <span>Carnívoros</span>
          </div>
        </div>
      </header>
    </div>
  );
}

export default SimpleApp;