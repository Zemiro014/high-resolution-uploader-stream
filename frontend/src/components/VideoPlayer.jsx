import { useEffect, useRef } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import PropTypes from 'prop-types';
import 'shaka-player/dist/controls.css'; // Estilos padrão do Google

export function VideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Gere a URL (Lembre-se: se o bucket for privado, use a URL pré-assinada)
  // const videoUrl = `https://amazonaws.com{fileKey}`;

  useEffect(() => {
    if (!videoUrl) return;

    const player = new shaka.Player(videoRef.current);

    // Configuração de UI (Controles bonitos do Google)
    const ui = new shaka.ui.Overlay(
      player,
      containerRef.current,
      videoRef.current
    );

    // Ouvir erros críticos
    player.addEventListener('error', (event) => {
      console.error('Erro no Shaka Player:', event.detail);
    });

    // Carregar o vídeo do S3
    player.load(videoUrl).then(() => {
      console.log('Vídeo carregado com sucesso via Shaka!');
    }).catch(e => console.error("Erro ao carregar vídeo:", e));

    // Cleanup ao desmontar o componente
    return () => {
      player.destroy();
      ui.destroy();
    };
  }, [videoUrl]);

  if (!videoUrl) return <p>Aguardando upload ou seleção de vídeo...</p>;

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: 'relative', width: '100%', paddingTop: '56.25%', // 16:9 Aspect Ratio
          backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <video
          ref={videoRef}
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' 
          }}
          autoPlay
        />
      </div>
      <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
        • Resolução adaptativa (HLS/Dash) via Shaka Player
      </p>
    </div>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
};
