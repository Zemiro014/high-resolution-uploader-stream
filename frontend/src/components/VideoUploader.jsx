import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { storageService } from '../api/storageService';
import { Upload, CheckCircle2, Loader2, Play } from 'lucide-react';

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
      const { data: initData } = await storageService.startUpload(file.name, file.type);
      const { uploadId, fileKey, fileId } = initData;

      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB (Mínimo permitido pelo S3)
      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const completedParts = [];

      for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const { data: partData } = await storageService.getPartUrl(fileKey, uploadId, partNumber);
        
        const response = await axios.put(partData.url, chunk, {
          onUploadProgress: (e) => {
            const partProgress = Math.round(((start + e.loaded) * 100) / file.size);
            setProgress(partProgress);
          }
        });

        completedParts.push({
          ETag: response.headers.etag,
          PartNumber: partNumber
        });
      }

      await storageService.completeUpload(fileKey, uploadId, completedParts);

      const { data: confirm } = await storageService.confirmUpload(fileId);
      
      setCurrentFileId(fileId);
      setIsProcessing(true);
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
        alert("Ainda processando... tente em 5 segundos."); 
      }
    } finally {
      setChecking(false);
    }
  };

return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
          Novo Vídeo
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Formatos suportados: MP4, MOV. Alta resolução garantida.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ 
          border: '2px dashed #e5e7eb', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center',
          backgroundColor: isUploading ? '#f9fafb' : 'transparent'
        }}>
          {!isUploading && !isProcessing && (
            <>
              <Upload style={{ margin: '0 auto 12px', color: '#9ca3af' }} size={32} />
              <input 
                type="file" 
                id="file-upload" 
                accept="video/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#2563eb', fontWeight: '500' }}>
                Clique para selecionar
              </label>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                {file ? file.name : "Nenhum arquivo selecionado"}
              </p>
            </>
          )}

          {isUploading && (
            <div>
              <Loader2 className="animate-spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
              <p style={{ fontWeight: '500', color: '#374151' }}>Enviando partes... {progress}%</p>
              <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {isProcessing && (
            <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <CheckCircle2 style={{ margin: '0 auto 12px', color: '#059669' }} />
              <p style={{ fontWeight: '600', color: '#059669' }}>Upload Concluído!</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>O MediaConvert está processando sua alta resolução...</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={uploadVideo} 
            disabled={!file || isUploading || isProcessing}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: (!file || isUploading || isProcessing) ? '#e5e7eb' : '#2563eb',
              color: '#fff',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isUploading ? 'Processando...' : 'Iniciar Upload'}
          </button>

          {isProcessing && (
            <button 
              onClick={handleCheckAndPlay}
              disabled={checking}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #2563eb',
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {checking ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              {checking ? 'Verificando...' : 'Assistir Agora'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

VideoUploader.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};
