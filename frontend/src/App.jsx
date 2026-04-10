import { useState, useEffect } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoGallery } from './components/VideoGallery';
import { storageService } from './api/storageService';
import { ToastContainer } from 'react-toastify';

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const fetchVideos = async () => {
    try {
      const { data } = await storageService.listVideos();
      setVideos(data);
    } catch (err) {
      console.error(`Erro ao carregar galeria: ${err}`);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      <h1>Plataforma VOD</h1>
      
      {/* Ao terminar o upload, recarregamos a galeria */}
      <VideoUploader onUploadSuccess={() => {
        fetchVideos();
        setSelectedUrl(null); // Opcional: resetar player
      }} />

      {selectedUrl && (
        <section style={{ marginTop: '40px', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2>Assistindo agora</h2>
             <button onClick={() => setSelectedUrl(null)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ef4444' }}>Fechar Player ✕</button>
          </div>
          <VideoPlayer videoUrl={selectedUrl} />
        </section>
      )}

      <VideoGallery 
        videos={videos} 
        onSelectVideo={(url) => {
          setSelectedUrl(url);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }} 
      />
      
      <ToastContainer theme="colored" />
    </div>
  );
}

export default App;
