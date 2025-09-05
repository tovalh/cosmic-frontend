import React, { useState, useEffect } from 'react';
import { CellDetails } from '../types/universe';

interface CellInspectorProps {
  cellId: number | null;
  onClose: () => void;
}

const CellInspector: React.FC<CellInspectorProps> = ({ cellId, onClose }) => {
  const [cellDetails, setCellDetails] = useState<CellDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cellId) {
      setCellDetails(null);
      return;
    }

    const fetchCellDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001';
        const response = await fetch(`${apiUrl}/api/cell/${cellId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setCellDetails(data);
          }
        } else {
          setError('Failed to fetch cell details');
        }
      } catch (err) {
        setError('Network error');
        console.error('Failed to fetch cell details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCellDetails();
  }, [cellId]);

  if (!cellId) {
    return null;
  }

  const getCellTypeIcon = (type: string): string => {
    switch (type) {
      case 'Planta': return '🌱';
      case 'Herbivoro': return '🐰';
      case 'Carnivoro': return '🦁';
      default: return '❓';
    }
  };

  const getCellTypeColor = (type: string): string => {
    switch (type) {
      case 'Planta': return '#4CAF50';
      case 'Herbivoro': return '#FFC107';
      case 'Carnivoro': return '#F44336';
      default: return '#666';
    }
  };

  const formatEnergy = (energy: number | undefined): string => {
    if (energy === undefined || energy === null) return 'N/A';
    return `${energy}/100`;
  };

  const getEnergyColor = (energy: number | undefined): string => {
    if (!energy) return '#666';
    if (energy > 70) return '#4CAF50';
    if (energy > 30) return '#FFC107';
    return '#F44336';
  };

  const getCuriosityLevel = (curiosity: number | undefined): string => {
    if (!curiosity) return 'N/A';
    if (curiosity > 0.7) return 'Very High';
    if (curiosity > 0.5) return 'High';
    if (curiosity > 0.3) return 'Medium';
    return 'Low';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '350px',
      maxHeight: '80vh',
      backgroundColor: '#1e1e1e',
      border: '2px solid #333',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      zIndex: 1000,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          Cell Inspector
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 8px'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        padding: '16px', 
        maxHeight: 'calc(80vh - 60px)', 
        overflowY: 'auto',
        scrollbarWidth: 'thin'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Loading cell data...</div>
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#F44336', 
            textAlign: 'center', 
            padding: '20px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        {cellDetails && !loading && !error && (
          <div>
            {/* Basic Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#2d2d2d',
              borderRadius: '6px',
              borderLeft: `4px solid ${getCellTypeColor(cellDetails.type)}`
            }}>
              <span style={{ fontSize: '24px', marginRight: '12px' }}>
                {getCellTypeIcon(cellDetails.type)}
              </span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {cellDetails.type} #{cellDetails.id}
                </div>
                <div style={{ fontSize: '12px', color: '#ccc' }}>
                  Position: ({cellDetails.position[0]}, {cellDetails.position[1]})
                </div>
              </div>
            </div>

            {/* Vital Stats */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#FFD700' }}>Vital Statistics</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px',
                backgroundColor: '#2d2d2d',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <div>
                  <strong>Age:</strong> {cellDetails.age} ticks
                </div>
                {cellDetails.energy !== undefined && (
                  <div>
                    <strong>Energy:</strong>{' '}
                    <span style={{ color: getEnergyColor(cellDetails.energy) }}>
                      {formatEnergy(cellDetails.energy)}
                    </span>
                  </div>
                )}
                {cellDetails.curiosity !== undefined && (
                  <div>
                    <strong>Curiosity:</strong> {getCuriosityLevel(cellDetails.curiosity)}
                  </div>
                )}
                {cellDetails.experimentation_cooldown !== undefined && (
                  <div>
                    <strong>Cooldown:</strong> {cellDetails.experimentation_cooldown}
                  </div>
                )}
              </div>
            </div>

            {/* Brain Info */}
            {cellDetails.brain_info && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#9C27B0' }}>🧠 Neural Network</h4>
                <div style={{
                  backgroundColor: '#2d2d2d',
                  padding: '12px',
                  borderRadius: '6px'
                }}>
                  {cellDetails.brain_info.fitness !== undefined && (
                    <div>
                      <strong>Fitness:</strong> {cellDetails.brain_info.fitness.toFixed(2)}
                    </div>
                  )}
                  {cellDetails.brain_info.generation !== undefined && (
                    <div>
                      <strong>Generation:</strong> {cellDetails.brain_info.generation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#FF9800' }}>🎒 Inventory ({cellDetails.inventory.length} items)</h4>
              <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '6px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {cellDetails.inventory.length === 0 ? (
                  <div style={{ padding: '12px', color: '#888' }}>No items</div>
                ) : (
                  cellDetails.inventory.map((item, index) => (
                    <div key={index} style={{
                      padding: '8px 12px',
                      borderBottom: index < cellDetails.inventory.length - 1 ? '1px solid #444' : 'none'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#ccc' }}>
                        Properties: {item.properties.join(', ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discoveries */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4CAF50' }}>
                🎉 Knowledge ({cellDetails.known_discoveries.length} discoveries)
              </h4>
              <div style={{
                backgroundColor: '#2d2d2d',
                borderRadius: '6px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {cellDetails.known_discoveries.length === 0 ? (
                  <div style={{ padding: '12px', color: '#888' }}>No discoveries yet</div>
                ) : (
                  cellDetails.known_discoveries.map((discovery, index) => (
                    <div key={index} style={{
                      padding: '8px 12px',
                      borderBottom: index < cellDetails.known_discoveries.length - 1 ? '1px solid #444' : 'none'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold',
                        color: discovery.significance > 15 ? '#FFD700' : 'white'
                      }}>
                        {discovery.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#ccc' }}>
                        Type: {discovery.type} • Significance: {discovery.significance.toFixed(1)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              padding: '12px',
              backgroundColor: '#2d2d2d',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#888' }}>
                This cell is {cellDetails.experimentation_cooldown && cellDetails.experimentation_cooldown > 0 
                  ? 'resting from experimentation' 
                  : cellDetails.inventory.length >= 2 
                    ? 'ready to experiment' 
                    : 'looking for materials'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CellInspector;