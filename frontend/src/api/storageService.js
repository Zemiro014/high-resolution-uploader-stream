import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

export const storageService = {
  startUpload: (fileName, fileType) => 
    api.post('/storage/start-multipart', { fileName, fileType }),

  getPartUrl: (fileKey, uploadId, partNumber) => 
    api.post('/storage/part-url', { fileKey, uploadId, partNumber }),

  completeUpload: (fileKey, uploadId, parts) => 
    api.post('/storage/complete-multipart', { fileKey, uploadId, parts }),

  confirmUpload: (fileId) => 
    api.patch(`/storage/confirm-upload/${fileId}`),

  getVideoDetails: (fileId) => api.get(`/storage/video/${fileId}`),

  listVideos: () => api.get('/storage/videos'),
}