import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService, DrawingRecord, DashboardStats } from '../../services/storageService';
import { DrawingCard } from './DrawingCard';
import {
  Image as ImageIcon,
  Star,
  Sparkles,
  Clock,
  Search,
  LayoutGrid,
  List,
  ArrowLeft,
  Plus,
  Loader2,
} from 'lucide-react';

interface MyDrawingsPageProps {
  onBackToStudio: () => void;
  onReopenDrawing: (drawing: DrawingRecord) => void;
}

export const MyDrawingsPage: React.FC<MyDrawingsPageProps> = ({ onBackToStudio, onReopenDrawing }) => {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState<DrawingRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Controls state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'favorites'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadCloudData = async () => {
    if (!user) return;
    setLoading(true);
    const data = await StorageService.fetchUserDrawings(user.uid);
    const dashboardStats = await StorageService.fetchDashboardStats(user.uid);
    setDrawings(data);
    setStats(dashboardStats);
    setLoading(false);
  };

  useEffect(() => {
    loadCloudData();
  }, [user]);

  const handleFavoriteToggle = async (drawingId: string, currentStatus: boolean) => {
    await StorageService.toggleFavorite(drawingId, currentStatus);
    setDrawings((prev) =>
      prev.map((d) => (d.id === drawingId ? { ...d, isFavorite: !currentStatus } : d))
    );
  };

  const handleRename = async (drawingId: string, newTitle: string) => {
    await StorageService.renameDrawing(drawingId, newTitle);
    setDrawings((prev) =>
      prev.map((d) => (d.id === drawingId ? { ...d, title: newTitle } : d))
    );
  };

  const handleDelete = async (drawingId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this drawing?')) return;
    await StorageService.deleteDrawing(user.uid, drawingId);
    setDrawings((prev) => prev.filter((d) => d.id !== drawingId));
  };

  // Filtered & Sorted Drawings
  const filteredDrawings = useMemo(() => {
    let result = [...drawings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.title.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortBy === 'favorites') {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'oldest') {
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      }
      // Newest first default
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    return result;
  }, [drawings, searchQuery, sortBy]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        padding: '2rem',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.12) 0px, transparent 50%)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={onBackToStudio}
            className="glass-panel"
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to Air Canvas Studio</span>
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            My Drawings & <span style={{ color: '#818cf8' }}>Dashboard</span>
          </h2>
        </div>

        {/* Dashboard Stats Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
              <div style={{ background: '#6366f120', padding: '12px', borderRadius: '12px', color: '#818cf8' }}>
                <ImageIcon size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Drawings</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{stats.totalDrawings}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
              <div style={{ background: '#facc1520', padding: '12px', borderRadius: '12px', color: '#facc15' }}>
                <Star size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Favorites</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{stats.favoritesCount}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
              <div style={{ background: '#c084fc20', padding: '12px', borderRadius: '12px', color: '#c084fc' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>AI Analyses</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{stats.aiAnalysesCount}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px' }}>
              <div style={{ background: '#34d39920', padding: '12px', borderRadius: '12px', color: '#34d399' }}>
                <Clock size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Last Activity</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{stats.lastActivity}</h4>
              </div>
            </div>
          </div>
        )}

        {/* Search, Sort, View Controls */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search drawings by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(0,0,0,0.3)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="title">Sort: Title A-Z</option>
              <option value="favorites">Sort: Favorites First</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#6366f1' : 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#6366f1' : 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Drawings Gallery Grid / List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#818cf8', gap: '0.6rem' }}>
            <Loader2 size={24} className="animate-spin" />
            <span>Loading cloud drawings...</span>
          </div>
        ) : filteredDrawings.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{ background: '#6366f120', padding: '16px', borderRadius: '50%', color: '#818cf8' }}>
              <Plus size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>No Drawings Found</h3>
            <p style={{ color: '#94a3b8', maxWidth: '400px', fontSize: '0.9rem' }}>
              {searchQuery ? 'No drawing matches your search query.' : 'Create your first air canvas sketch to get started!'}
            </p>
            <button className="btn-primary" onClick={onBackToStudio} style={{ marginTop: '0.5rem' }}>
              Start Air Drawing Now
            </button>
          </div>
        ) : (
          <div
            style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              flexDirection: viewMode === 'list' ? 'column' : 'initial',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
              gap: '1.5rem',
            }}
          >
            {filteredDrawings.map((dwg) => (
              <DrawingCard
                key={dwg.id}
                drawing={dwg}
                viewMode={viewMode}
                onReopen={onReopenDrawing}
                onFavoriteToggle={handleFavoriteToggle}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
