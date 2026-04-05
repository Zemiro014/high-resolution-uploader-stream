import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

export const storageService = {
      // 1. Pede a URL de upload
  getPresignedUrl: (fileName, fileType) => 
    api.post('/storage/generate-upload-url', { fileName, fileType }),

  // 2. Faz o PUT direto para o S3
  uploadToS3: (url, file) => 
    axios.put(url, file, { headers: { 'Content-Type': file.type } }),

  // 3. Confirma o sucesso no seu Backend
  confirmUpload: (fileId) => 
    api.patch(`/storage/confirm-upload/${fileId}`)
}