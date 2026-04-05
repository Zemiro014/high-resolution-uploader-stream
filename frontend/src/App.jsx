import { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { VideoPlayer } from './components/VideoPlayer';

function App() {
  const [uploadedFileId, setUploadedFileId] = useState(null);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Plataforma de Vídeo VOD</h1>
      
      <VideoUploader onUploadSuccess={(id) => setUploadedFileId(id)} />

      <div style={{ marginTop: '40px' }}>
        {uploadedFileId ? (
          <>
            <p>Status: Aguardando processamento do MediaConvert...</p>
            {/* Aqui, no futuro, passaremos a URL .m3u8 vinda do Banco de Dados */}
            <VideoPlayer fileKey={`aguardando-id-${uploadedFileId}`} />
          </>
        ) : (
          <p>Faça um upload para visualizar o player.</p>
        )}
      </div>
    </div>
  );
}

export default App;
