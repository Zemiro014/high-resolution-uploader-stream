import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { storageService } from '../api/storageService';

export function VideoUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadVideo = async () => {
    if (!file) return alert("Selecione um arquivo primeiro!");

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Obter URL pré-assinada do seu Backend Node.js
      // Enviamos o nome e tipo para o backend registrar no Postgres como PENDING
      const { data } = await storageService.getPresignedUrl(file.name, file.type);

      const { uploadUrl, fileId } = data;

      // 2. Upload Direto para o S3 usando a URL recebida
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      // 3. Confirmar upload no Backend para disparar o próximo passo (MediaConvert)
      await storageService.confirmUpload(fileId)

      alert("Vídeo enviado com sucesso! O processamento iniciará em breve.");
      
      // Notifica o componente pai (App.jsx) que o upload terminou
      onUploadSuccess(fileId);

    } catch (error) {
      console.error("Erro no fluxo de upload:", error);
      alert("Erro ao enviar vídeo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h3>Upload de Vídeo Profissional</h3>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleFileChange} 
        disabled={isUploading}
      />
      
      <button 
        onClick={uploadVideo} 
        disabled={!file || isUploading}
        style={{ marginLeft: '10px' }}
      >
        {isUploading ? `Enviando ${progress}%` : "Iniciar Upload"}
      </button>

      {isUploading && (
        <div style={{ width: '100%', backgroundColor: '#ddd', marginTop: '10px' }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '10px', 
            backgroundColor: '#4caf50',
            transition: 'width 0.3s' 
          }} />
        </div>
      )}
    </div>
  );
}

VideoUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};
