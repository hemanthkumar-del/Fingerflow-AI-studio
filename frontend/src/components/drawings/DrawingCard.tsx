import React, { useState } from 'react';
import { DrawingRecord } from '../../services/storageService';
import { Star, Edit2, Trash2, ExternalLink, Calendar, Check, X } from 'lucide-react';

interface DrawingCardProps {
  drawing: DrawingRecord;
  viewMode: 'grid' | 'list';
  onReopen: (drawing: DrawingRecord) => void;
  onFavoriteToggle: (drawingId: string, currentStatus: boolean) => void;
  onRename: (drawingId: string, newTitle: string) => void;
  onDelete: (drawingId: string) => void;
}

export const DrawingCard: React.FC<DrawingCardProps> = ({
  drawing,
  viewMode,
  onReopen,
  onFavoriteToggle,
  onRename,
  onDelete,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(drawing.title);

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput !== drawing.title) {
      onRename(drawing.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '12px',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <img
            src={drawing.thumbnailUrl || drawing.imageUrl}
            alt={drawing.title}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />

          <div style={{ flex: 1 }}>
            {isEditingTitle ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid #818cf8',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                  autoFocus
                />
                <button onClick={handleSaveTitle} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' }}>
                  <Check size={16} />
                </button>
                <button onClick={() => setIsEditingTitle(false)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>{drawing.title}</h4>
                <button onClick={() => setIsEditingTitle(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              <Calendar size={12} />
              <span>Air Canvas Drawing</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => onFavoriteToggle(drawing.id, drawing.isFavorite)}
            style={{
              background: 'none',
              border: 'none',
              color: drawing.isFavorite ? '#facc15' : '#64748b',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <Star size={18} fill={drawing.isFavorite ? '#facc15' : 'none'} />
          </button>

          <button
            onClick={() => onReopen(drawing)}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} />
            <span>Reopen</span>
          </button>

          <button
            onClick={() => onDelete(drawing.id)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Grid View Layout
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#090d16' }}>
        <img
          src={drawing.thumbnailUrl || drawing.imageUrl}
          alt={drawing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={() => onFavoriteToggle(drawing.id, drawing.isFavorite)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            padding: '6px',
            color: drawing.isFavorite ? '#facc15' : '#ffffff',
            cursor: 'pointer',
          }}
        >
          <Star size={16} fill={drawing.isFavorite ? '#facc15' : 'none'} />
        </button>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {isEditingTitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid #818cf8',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
              }}
              autoFocus
            />
            <button onClick={handleSaveTitle} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' }}>
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {drawing.title}
            </h4>
            <button onClick={() => setIsEditingTitle(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={() => onReopen(drawing)}
            className="btn-primary"
            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={14} />
            <span>Reopen</span>
          </button>

          <button
            onClick={() => onDelete(drawing.id)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
