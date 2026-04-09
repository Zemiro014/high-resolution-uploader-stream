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
    try {
      const { data } = await storageService.getVideoDetails(currentFileId);
      
      if (data.status === "PROCESSED" && data.videoUrl) {
        onUploadSuccess(data.videoUrl); // Envia a URL para o player
        setIsProcessing(false);
      } else {
        alert("O vídeo ainda está sendo processado. Tente novamente em alguns segundos.");
      }
    } catch (error) {
      alert(`Erro ao verificar status do vídeo: ${error}`);
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

      {isProcessing && (
        <div className="mt-4 p-4 border rounded bg-blue-50">
          <p className="text-blue-700">Vídeo enviado com sucesso!</p>
          <button 
            onClick={handleCheckAndPlay}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Assistir Vídeo
          </button>
        </div>
      )}
    </div>
  );
}

VideoUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};
