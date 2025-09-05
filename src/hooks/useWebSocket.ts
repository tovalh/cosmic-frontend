import { useState, useEffect, useRef } from 'react';
import { UniverseState } from '../types/universe';

interface UseWebSocketReturn {
  universeState: UniverseState | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: string | null;
  sendMessage: (message: string) => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [universeState, setUniverseState] = useState<UniverseState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  const connect = () => {
    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setLastError(null);
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          sendMessage('ping');
        }, 30000); // 30 seconds
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'universe_update') {
            setUniverseState(data as UniverseState);
          } else if (event.data === 'pong') {
            // Heartbeat response - ignore
            return;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Attempt to reconnect after 3 seconds
        if (event.code !== 1000) { // Not a normal closure
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setLastError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('error');
      setLastError('Failed to create connection');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [url, connect]);

  return {
    universeState,
    connectionStatus,
    lastError,
    sendMessage
  };
};