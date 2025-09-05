import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Planet } from '../types/universe';

interface UniverseCanvasProps {
  planets: Planet[];
  onCellClick: (cellId: number) => void;
}

const UniverseCanvas: React.FC<UniverseCanvasProps> = ({ planets, onCellClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });
  
  const getPlanetColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      terran: '#4CAF50',
      volcanic: '#FF5722',
      ice: '#2196F3',
      crystal: '#9C27B0',
      quantum: '#FF9800',
      ocean: '#00BCD4',
      desert: '#FFC107',
      toxic: '#8BC34A',
      magnetic: '#607D8B',
      gas_giant: '#E91E63'
    };
    return colors[type] || '#666';
  };

  const getCellColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Planta': '#4CAF50',
      'Herbivoro': '#FFC107', 
      'Carnivoro': '#F44336'
    };
    return colors[type] || '#666';
  };

  const drawPlanets = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with space background
    ctx.fillStyle = '#000014';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1, 1
      );
    }

    if (!planets || planets.length === 0) {
      // Show loading message
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading Universe...', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Calculate planet positions
    const planetsPerRow = Math.ceil(Math.sqrt(planets.length));
    const planetSpacing = 250;
    const startX = (canvas.width - (planetsPerRow - 1) * planetSpacing) / 2;
    const startY = 120;

    planets.forEach((planet, index) => {
      const row = Math.floor(index / planetsPerRow);
      const col = index % planetsPerRow;
      const planetX = startX + col * planetSpacing;
      const planetY = startY + row * planetSpacing;

      // Planet background circle
      ctx.beginPath();
      ctx.arc(planetX, planetY, 80, 0, 2 * Math.PI);
      ctx.fillStyle = getPlanetColor(planet.type);
      ctx.fill();
      ctx.strokeStyle = selectedPlanet === planet.id ? '#FFD700' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = selectedPlanet === planet.id ? 3 : 1;
      ctx.stroke();

      // Planet name and stats
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, planetX, planetY - 110);
      
      // Temperature
      const tempColor = planet.conditions.temperature > 30 ? '#FF5722' : 
                       planet.conditions.temperature < 0 ? '#2196F3' : '#4CAF50';
      ctx.fillStyle = tempColor;
      ctx.font = '12px Arial';
      ctx.fillText(`${planet.conditions.temperature.toFixed(0)}°C`, planetX, planetY - 95);

      // Population stats
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      const totalCells = planet.cell_counts.plants + planet.cell_counts.herbivores + planet.cell_counts.carnivores;
      ctx.fillText(`Pop: ${totalCells}`, planetX, planetY + 100);
      
      // Discovery stats
      if (planet.total_discoveries > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`🎉 ${planet.total_discoveries} discoveries`, planetX, planetY + 112);
      }

      // Draw cells on planet surface
      if (selectedPlanet === planet.id) {
        // Detailed view - show individual cells
        const cellScale = 100 / Math.max(planet.size[0], planet.size[1]);
        
        planet.cells.forEach(cell => {
          const cellX = planetX - 50 + (cell.x * cellScale);
          const cellY = planetY - 50 + (cell.y * cellScale);
          
          ctx.beginPath();
          ctx.arc(cellX, cellY, Math.max(1, cellScale * 0.8), 0, 2 * Math.PI);
          ctx.fillStyle = getCellColor(cell.type);
          ctx.fill();
          
          // Highlight cells with inventory or discoveries
          if (cell.inventory_count > 0 || cell.discoveries_count > 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
        
        // Show planet details panel
        drawPlanetDetails(ctx, planet, planetX + 120, planetY - 80);
      } else {
        // Overview - show population dots
        const herbivores = planet.cell_counts.herbivores;
        const carnivores = planet.cell_counts.carnivores;
        
        // Herbivore dots
        for (let i = 0; i < Math.min(herbivores, 20); i++) {
          const angle = (i / 20) * Math.PI * 2;
          const dotX = planetX + Math.cos(angle) * 60;
          const dotY = planetY + Math.sin(angle) * 60;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, 2 * Math.PI);
          ctx.fillStyle = getCellColor('Herbivoro');
          ctx.fill();
        }
        
        // Carnivore dots
        for (let i = 0; i < Math.min(carnivores, 10); i++) {
          const angle = (i / 10) * Math.PI * 2 + Math.PI/10;
          const dotX = planetX + Math.cos(angle) * 45;
          const dotY = planetY + Math.sin(angle) * 45;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = getCellColor('Carnivoro');
          ctx.fill();
        }
      }
    });
  }, [planets, selectedPlanet]);

  const drawPlanetDetails = (ctx: CanvasRenderingContext2D, planet: Planet, x: number, y: number) => {
    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, 200, 120);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(x, y, 200, 120);
    
    // Details text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    const details = [
      `Size: ${planet.size[0]}x${planet.size[1]}`,
      `Plants: ${planet.cell_counts.plants}`,
      `Herbivores: ${planet.cell_counts.herbivores}`,
      `Carnivores: ${planet.cell_counts.carnivores}`,
      `Inventory: ${planet.total_inventory} items`,
      `Materials: ${planet.scattered_materials}`,
      `Trade Routes: ${planet.trade_routes}`,
      `Discovery Bonus: x${planet.discovery_multiplier.toFixed(1)}`
    ];
    
    details.forEach((detail, index) => {
      ctx.fillText(detail, x + 10, y + 20 + index * 12);
    });
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a planet
    const planetsPerRow = Math.ceil(Math.sqrt(planets.length));
    const planetSpacing = 250;
    const startX = (canvas.width - (planetsPerRow - 1) * planetSpacing) / 2;
    const startY = 120;

    for (let index = 0; index < planets.length; index++) {
      const row = Math.floor(index / planetsPerRow);
      const col = index % planetsPerRow;
      const planetX = startX + col * planetSpacing;
      const planetY = startY + row * planetSpacing;

      const distance = Math.sqrt((x - planetX) ** 2 + (y - planetY) ** 2);
      
      if (distance <= 80) {
        // Clicked on planet
        if (selectedPlanet === planets[index].id) {
          // Already selected - check if clicked on a cell
          if (selectedPlanet) {
            const planet = planets.find(p => p.id === selectedPlanet);
            if (planet) {
              const cellScale = 100 / Math.max(planet.size[0], planet.size[1]);
              
              for (const cell of planet.cells) {
                const cellX = planetX - 50 + (cell.x * cellScale);
                const cellY = planetY - 50 + (cell.y * cellScale);
                const cellDistance = Math.sqrt((x - cellX) ** 2 + (y - cellY) ** 2);
                
                if (cellDistance <= Math.max(3, cellScale * 0.8)) {
                  onCellClick(cell.id);
                  return;
                }
              }
            }
          }
        } else {
          // Select this planet
          setSelectedPlanet(planets[index].id);
        }
        return;
      }
    }

    // Clicked on empty space - deselect
    setSelectedPlanet(null);
  }, [planets, selectedPlanet, onCellClick]);

  useEffect(() => {
    drawPlanets();
  }, [drawPlanets]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        setCanvasSize({
          width: container.clientWidth - 20,
          height: Math.max(700, container.clientHeight - 100)
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="universe-canvas-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{ 
          border: '1px solid #333',
          cursor: 'pointer',
          backgroundColor: '#000014'
        }}
      />
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px',
        borderRadius: '4px'
      }}>
        Click planets to zoom in • Click cells to inspect • Click empty space to zoom out
      </div>
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'white',
        fontSize: '11px',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px',
        borderRadius: '4px'
      }}>
        <div>🟢 Plants • 🟡 Herbivores • 🔴 Carnivores</div>
        <div>⭐ Golden rings = Items/Discoveries</div>
      </div>
    </div>
  );
};

export default UniverseCanvas;