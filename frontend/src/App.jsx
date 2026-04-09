import { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayer } from './components/VideoPlayer';

function App() {
  const [videoUrl, setVideoUrl] = useState(null);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#1a1a1a', fontSize: '2.5rem' }}>Studio VOD</h1>
        <p style={{ color: '#666' }}>Upload de alta resolução com processamento AWS</p>
      </header>
      
      <section style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '30px' }}>
        <VideoUploader onUploadSuccess={(url) => setVideoUrl(url)} />
      </section>

      <section style={{ marginTop: '50px' }}>
        {videoUrl ? (
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            <h2 style={{ marginBottom: '20px' }}>Seu Vídeo Processado</h2>
            <VideoPlayer videoUrl={videoUrl} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #ddd', borderRadius: '12px', color: '#888' }}>
             <p>O player aparecerá aqui assim que o processamento for concluído.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
