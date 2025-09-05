import React, { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import UniverseCanvas from './components/UniverseCanvas';
import CellInspector from './components/CellInspector';
import './App.css';

function App() {
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/ws';
  const { universeState, connectionStatus, lastError } = useWebSocket(wsUrl);
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);

  const handleCellClick = (cellId: number) => {
    setSelectedCellId(cellId);
  };

  const getConnectionStatusColor = (): string => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#F44336';
      case 'error': return '#F44336';
      default: return '#666';
    }
  };

  const getConnectionStatusText = (): string => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header style={{
        backgroundColor: '#1e1e1e',
        padding: '12px 20px',
        borderBottom: '2px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            color: 'white',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🌌 Cosmic Genesis
            {universeState && (
              <span style={{ 
                fontSize: '14px', 
                color: '#FFD700',
                fontWeight: 'normal' 
              }}>
                Step {universeState.step.toLocaleString()}
              </span>
            )}
          </h1>
          {universeState && (
            <div style={{ 
              fontSize: '12px', 
              color: '#ccc',
              marginTop: '4px' 
            }}>
              Last update: {formatTimestamp(universeState.timestamp)}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#2d2d2d',
            borderRadius: '20px',
            fontSize: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getConnectionStatusColor()
            }} />
            <span style={{ color: 'white' }}>
              {getConnectionStatusText()}
            </span>
          </div>
          
          {lastError && (
            <div style={{
              color: '#F44336',
              fontSize: '12px',
              padding: '6px 12px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: '4px'
            }}>
              {lastError}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#000014'
      }}>
        {/* Left Sidebar - Stats */}
        <div style={{
          width: '300px',
          backgroundColor: '#1e1e1e',
          borderRight: '2px solid #333',
          padding: '16px',
          overflowY: 'auto'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 16px 0' }}>Universe Stats</h3>
          
          {universeState ? (
            <div style={{ color: 'white', fontSize: '14px' }}>
              {/* Planets Overview */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#FFD700', margin: '0 0 8px 0' }}>🪐 Planets ({universeState.planets.length})</h4>
                {universeState.planets.map(planet => (
                  <div key={planet.id} style={{
                    padding: '8px',
                    margin: '4px 0',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#4CAF50',
                      marginBottom: '2px'
                    }}>
                      {planet.name}
                    </div>
                    <div>Population: {
                      planet.cell_counts.plants + 
                      planet.cell_counts.herbivores + 
                      planet.cell_counts.carnivores
                    }</div>
                    <div>🌱{planet.cell_counts.plants} 🐰{planet.cell_counts.herbivores} 🦁{planet.cell_counts.carnivores}</div>
                    <div>Temp: {planet.conditions.temperature.toFixed(0)}°C</div>
                    {planet.total_discoveries > 0 && (
                      <div style={{ color: '#FFD700' }}>
                        🎉 {planet.total_discoveries} discoveries
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Discovery Stats */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#FFD700', margin: '0 0 8px 0' }}>
                  🎉 Discoveries ({universeState.discovery_stats.total_discoveries})
                </h4>
                {universeState.discovery_stats.recent_discoveries.length > 0 ? (
                  universeState.discovery_stats.recent_discoveries.map((discovery, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      margin: '4px 0',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold',
                        color: discovery.significance > 15 ? '#FFD700' : 'white'
                      }}>
                        {discovery.name}
                      </div>
                      <div style={{ color: '#ccc' }}>
                        Type: {discovery.type} • Score: {discovery.significance.toFixed(1)}
                      </div>
                      <div style={{ color: '#888', fontSize: '10px' }}>
                        By: {discovery.discoverer.replace('Cell_', 'Cell ')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    No discoveries yet...
                  </div>
                )}
              </div>

              {/* Cosmic Events */}
              {universeState.cosmic_events.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#FF5722', margin: '0 0 8px 0' }}>⚡ Cosmic Events</h4>
                  {universeState.cosmic_events.map((event, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      margin: '4px 0',
                      backgroundColor: '#2d2d2d',
                      borderRadius: '4px',
                      fontSize: '11px',
                      borderLeft: '3px solid #FF5722'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{event.name}</div>
                      <div style={{ color: '#ccc', margin: '2px 0' }}>
                        {event.description}
                      </div>
                      <div style={{ color: '#888' }}>
                        Duration: {event.duration} ticks
                      </div>
                      <div style={{ color: '#888', fontSize: '10px' }}>
                        Affects: {event.affected_planets.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div style={{ color: '#888', textAlign: 'center', padding: '40px 20px' }}>
              {connectionStatus === 'connected' ? 'Loading universe data...' : 'Waiting for connection...'}
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {universeState ? (
            <UniverseCanvas 
              planets={universeState.planets} 
              onCellClick={handleCellClick}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'white',
              fontSize: '18px'
            }}>
              {connectionStatus === 'connected' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌌</div>
                  <div>Loading Cosmic Genesis...</div>
                  <div style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
                    Initializing universe simulation
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                  <div>Unable to connect to universe</div>
                  <div style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
                    Make sure the backend server is running on port 8000
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cell Inspector Modal */}
      {selectedCellId && (
        <CellInspector 
          cellId={selectedCellId}
          onClose={() => setSelectedCellId(null)}
        />
      )}
    </div>
  );
}

export default App;
