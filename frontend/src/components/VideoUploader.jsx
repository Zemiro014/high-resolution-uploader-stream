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
    
    onUploadSuccess(confirm.videoUrl);
    alert("Upload finalizado!");

  } catch (error) {
    console.error(error);
    alert("Erro no upload multipart");
  } finally {
    setIsUploading(false);
  }
    // try {
    //   // 1. Obter URL pré-assinada do seu Backend Node.js
    //   // Enviamos o nome e tipo para o backend registrar no Postgres como PENDING
    //   const { data: presignedData } = await storageService.getPresignedUrl(file.name, file.type);

    //   const { uploadUrl, fileid } = presignedData;

    //   // 2. Upload Direto para o S3 usando a URL recebida
    //   await axios.put(uploadUrl, file, {
    //     headers: { 
    //       'Content-Type': file.type,
    //       'x-amz-meta-fileid': fileid
    //      },
    //     onUploadProgress: (progressEvent) => {
    //       const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //       setProgress(percentCompleted);
    //     }
    //   });

    //   // 3. Confirmar upload no Backend para disparar o próximo passo (MediaConvert)
    //   const { data: confirmationData } = await storageService.confirmUpload(fileid, { status: "PROCESSING" })
    //   const { message, videoUrl} = confirmationData;

    //   console.log("VIDEO URL: "+videoUrl)

    //   alert(message);
      
    //   // Notifica o componente pai (App.jsx) que o upload terminou
    //   onUploadSuccess(videoUrl);

    // } catch (error) {
    //   console.error("Erro no fluxo de upload:", error);
    //   alert("Erro ao enviar vídeo.");
    // } finally {
    //   setIsUploading(false);
    // }
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
