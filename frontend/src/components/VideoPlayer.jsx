import { useEffect, useRef } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import PropTypes from 'prop-types';
import 'shaka-player/dist/controls.css';

export function VideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoUrl) return;

    const absoluteUrl = videoUrl.startsWith('http') 
      ? videoUrl 
      : `https://${videoUrl}`;

    const player = new shaka.Player();
    player.attach(videoRef.current);

    const ui = new shaka.ui.Overlay(
      player,
      containerRef.current,
      videoRef.current
    );

    player.addEventListener('error', (event) => {
      console.error('Erro no Shaka Player:', event.detail);
    });

    console.log("URL Absoluta enviada ao Shaka:", absoluteUrl);

    player.load(absoluteUrl).then(() => {
      console.log('Vídeo carregado com sucesso via Shaka!');
    }).catch(e => console.error("Erro ao carregar vídeo:", e));

    return () => {
      player.destroy();
      ui.destroy();
    };
  }, [videoUrl]);

  if (!videoUrl) return <p>Aguardando upload ou seleção de vídeo...</p>;

 return (
    <div style={{ width: '100%', animation: 'fadeIn 0.5s ease-in' }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%', // 16:9
          backgroundColor: '#000', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        }}
      >
        <video
          ref={videoRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          autoPlay
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: '#6b7280', fontSize: '0.875rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></div>
        Reproduzindo em Alta Definição (HLS/Dash)
      </div>
    </div>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
};
