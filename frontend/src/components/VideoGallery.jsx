import { Play, Clock, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

export function VideoGallery({ videos, onSelectVideo }) {
  if (videos.length === 0) return null;

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '24px', color: '#111827' }}>Sua Galeria</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {videos.map((video) => (
          <div 
            key={video.id}
            onClick={() => video.status === 'PROCESSED' && onSelectVideo(video.videoUrl)}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              cursor: video.status === 'PROCESSED' ? 'pointer' : 'default',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => video.status === 'PROCESSED' && (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Thumbnail Placeholder */}
            <div style={{ 
              width: '100%', 
              height: '160px', 
              backgroundColor: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              {video.status === 'PROCESSED' ? (
                <Play color="white" fill="white" size={40} opacity={0.8} />
              ) : (
                <Loader2 className="animate-spin" color="white" size={32} />
              )}
            </div>

            <div style={{ padding: '16px' }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '0.95rem', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {video.fileName}
              </h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  backgroundColor: video.status === 'PROCESSED' ? '#d1fae5' : '#fef3c7',
                  color: video.status === 'PROCESSED' ? '#065f46' : '#92400e',
                  fontWeight: '600'
                }}>
                  {video.status}
                </span>
                <Clock size={14} color="#9ca3af" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

VideoGallery.propTypes = {
    onSelectVideo: PropTypes.func.isRequired,
}

VideoGallery.propTypes = {
  videos: PropTypes.array.isRequired,
};
