import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { storageService } from '../api/storageService';

export function VideoUploader({ onUploadSuccess }) {
  const [currentFileId, setCurrentFileId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [checking, setChecking] = useState(false)

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadVideo = async () => {
    if (!file) return alert("Selecione um arquivo primeiro!");

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Inicia o Multipart no S3
      const { data: initData } = await storageService.startUpload(file.name, file.type);
      const { uploadId, fileKey, fileId } = initData;

      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB (Mínimo permitido pelo S3)
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const completedParts = [];

      // 2. Loop para enviar cada parte
      for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Busca URL assinada para esta parte específica
        const { data: partData } = await storageService.getPartUrl(fileKey, uploadId, partNumber);
        
        // Upload do chunk direto para o S3
        const response = await axios.put(partData.url, chunk, {
          onUploadProgress: (e) => {
            const partProgress = Math.round(((start + e.loaded) * 100) / file.size);
            setProgress(partProgress);
          }
        });

        // Importante: Guardar o ETag retornado pelo S3
        completedParts.push({
          ETag: response.headers.etag,
          PartNumber: partNumber
        });
      }

      // 3. Finaliza no S3 (Faz o "merge" das partes)
      await storageService.completeUpload(fileKey, uploadId, completedParts);

      // 4. Confirma no seu banco de dados
      const { data: confirm } = await storageService.confirmUpload(fileId);
      
      setCurrentFileId(fileId);
      setIsProcessing(true);
      // onUploadSuccess(confirm.message);
      console.log(confirm.message)
      alert("Upload pronto! O vídeo está sendo processado.");

    } catch (error) {
      console.error(error);
      alert("Erro no upload multipart");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckAndPlay = async () => {
    setChecking(true);
    try {
      const { data } = await storageService.getVideoDetails(currentFileId);
      if (data.status === "PROCESSED" && data.videoUrl) {
        onUploadSuccess(data.videoUrl);
        setIsProcessing(false);
      } else {
        // Feedback suave em vez de alert
        alert("Ainda processando... tente em 5 segundos."); 
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <label style={{ 
          padding: '12px 20px', backgroundColor: '#f0f0f0', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ccc' 
        }}>
          {file ? file.name : "Selecionar Vídeo"}
          <input type="file" accept="video/*" onChange={handleFileChange} hidden />
        </label>

        <button 
          onClick={uploadVideo} 
          disabled={!file || isUploading}
          style={{ 
            padding: '12px 30px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: '600', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1
          }}
        >
          {isUploading ? `Enviando ${progress}%` : "Fazer Upload"}
        </button>
      </div>

      {isUploading && (
        <div style={{ height: '8px', width: '100%', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#007bff', transition: 'width 0.4s ease' }} />
        </div>
      )}

      {isProcessing && (
        <div style={{ 
          marginTop: '20px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px', 
          border: '1px solid #b3d7ff', textAlign: 'center' 
        }}>
          <p style={{ color: '#0056b3', fontWeight: '500', marginBottom: '15px' }}>
            🎉 Upload concluído! Estamos otimizando seu vídeo para alta resolução.
          </p>
          <button 
            onClick={handleCheckAndPlay}
            disabled={checking}
            style={{ 
              padding: '10px 25px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' 
            }}
          >
            {checking ? "Verificando..." : "Verificar se está pronto"}
          </button>
        </div>
      )}
    </div>
  );
}

VideoUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};
