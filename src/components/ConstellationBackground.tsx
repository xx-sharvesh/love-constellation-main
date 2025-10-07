import React, { useEffect, useRef } from 'react';

const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createStars = () => {
      const container = canvasRef.current;
      if (!container) return;

      // Clear existing stars
      container.innerHTML = '';

      // Create fewer individual twinkling stars (reduced from 150 to 80)
      for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
      }

      // Create fewer constellation groups (reduced from 8 to 5)
      for (let j = 0; j < 5; j++) {
        const constellation = document.createElement('div');
        constellation.className = 'constellation';
        constellation.style.top = `${Math.random() * 80 + 10}%`;
        constellation.style.left = `${Math.random() * 80 + 10}%`;
        constellation.style.animationDelay = `${Math.random() * 8}s`;
        
        // Add stars to constellation with better positioning
        const starsInConstellation = Math.floor(Math.random() * 4) + 3; // 3-6 stars
        const positions = [];
        
        for (let k = 0; k < starsInConstellation; k++) {
          const constellationStar = document.createElement('div');
          constellationStar.className = 'star';
          constellationStar.style.position = 'absolute';
          
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          constellationStar.style.top = `${y}%`;
          constellationStar.style.left = `${x}%`;
          constellationStar.style.width = `${Math.random() * 4 + 2}px`;
          constellationStar.style.height = constellationStar.style.width;
          constellationStar.style.animationDelay = `${Math.random() * 3}s`;
          
          positions.push({x, y});
          constellation.appendChild(constellationStar);
        }
        
        // Create lines between stars in constellation
        for (let k = 0; k < positions.length - 1; k++) {
          for (let l = k + 1; l < positions.length; l++) {
            if (Math.random() > 0.6) {
              const line = document.createElement('div');
              line.className = 'constellation-line';
              line.style.position = 'absolute';
              
              const dx = positions[l].x - positions[k].x;
              const dy = positions[l].y - positions[k].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              line.style.width = `${distance}%`;
              line.style.left = `${positions[k].x}%`;
              line.style.top = `${positions[k].y}%`;
              
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              line.style.transform = `rotate(${angle}deg)`;
              
              constellation.appendChild(line);
            }
          }
        }
        
        container.appendChild(constellation);
      }

      // Add occasional shooting star
      const addShootingStar = () => {
        const meteor = document.createElement('div');
        meteor.style.position = 'absolute';
        meteor.style.top = `${Math.random() * 50}%`;
        meteor.style.left = '-100px';
        meteor.style.width = '2px';
        meteor.style.height = '2px';
        meteor.style.background = 'hsl(var(--star-glow))';
        meteor.style.borderRadius = '50%';
        meteor.style.boxShadow = '0 0 10px hsl(var(--star-glow))';
        meteor.style.animation = 'meteor 3s linear forwards';
        
        container.appendChild(meteor);
        
        setTimeout(() => {
          if (meteor.parentNode) {
            meteor.parentNode.removeChild(meteor);
          }
        }, 3000);
      };

      // Add shooting star every 15-30 seconds (less frequent)
      const meteorInterval = setInterval(() => {
        if (Math.random() > 0.8) {
          addShootingStar();
        }
      }, Math.random() * 15000 + 15000);

      return () => clearInterval(meteorInterval);
    };

    const cleanup = createStars();
    return cleanup;
  }, []);

  return (
    <div 
      ref={canvasRef}
      className="constellation-bg"
      aria-hidden="true"
    />
  );
};

export default ConstellationBackground;