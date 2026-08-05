import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Search,
  FileText,
  Calculator,
  Shapes,
  X,
  Copy,
  Check,
  Loader2,
  Maximize2,
} from 'lucide-react';
import {
  AIServiceClient,
  AIAnalysisResponse,
  AIEnhanceResponse,
  AIOCRResponse,
  AIMathResponse,
  AIShapeResponse,
} from '../services/aiService';

interface AISidebarProps {
  getCanvasImage: () => string | null;
}

const STYLE_PRESETS = [
  'Vector Art',
  'Realistic Photo',
  'Anime Illustration',
  '3D Render',
  'Cyberpunk Neon',
  'Concept Art',
];

export const AISidebar: React.FC<AISidebarProps> = ({ getCanvasImage }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'enhance' | 'analyze' | 'ocr' | 'shapes'>('enhance');

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);

  // Form inputs
  const [prompt, setPrompt] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('Vector Art');

  // API Results state
  const [enhanceResult, setEnhanceResult] = useState<AIEnhanceResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null);
  const [ocrResult, setOcrResult] = useState<AIOCRResponse | null>(null);
  const [mathResult, setMathResult] = useState<AIMathResponse | null>(null);
  const [shapeResult, setShapeResult] = useState<AIShapeResponse | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  // Trigger Enhance API
  const handleEnhance = async () => {
    const imgB64 = getCanvasImage();
    if (!imgB64) return;
    setLoading(true);
    const res = await AIServiceClient.enhanceSketch(imgB64, prompt, selectedStyle);
    setEnhanceResult(res);
    setLoading(false);
  };

  // Trigger Analyze API
  const handleAnalyze = async () => {
    const imgB64 = getCanvasImage();
    if (!imgB64) return;
    setLoading(true);
    const res = await AIServiceClient.analyzeSketch(imgB64, prompt);
    setAnalysisResult(res);
    setLoading(false);
  };

  // Trigger OCR API
  const handleOCR = async () => {
    const imgB64 = getCanvasImage();
    if (!imgB64) return;
    setLoading(true);
    const res = await AIServiceClient.extractOCR(imgB64);
    setOcrResult(res);
    setLoading(false);
  };

  // Trigger Math Solver API
  const handleMath = async () => {
    const imgB64 = getCanvasImage();
    if (!imgB64) return;
    setLoading(true);
    const res = await AIServiceClient.solveMath(imgB64);
    setMathResult(res);
    setLoading(false);
  };

  // Trigger Shape Recognition API
  const handleShapes = async () => {
    const imgB64 = getCanvasImage();
    if (!imgB64) return;
    setLoading(true);
    const res = await AIServiceClient.recognizeShapes(imgB64);
    setShapeResult(res);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Sidebar Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 25,
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4))',
            border: '1px solid rgba(192, 132, 252, 0.4)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
          }}
        >
          <Sparkles size={18} color="#c084fc" />
          <span>Gemini AI Studio</span>
        </button>
      )}

      {/* Slide-out Glassmorphism Sidebar Panel */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '380px',
            height: '100vh',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: '#a855f720', padding: '6px', borderRadius: '8px' }}>
                <Sparkles size={20} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '0.5rem',
              gap: '0.25rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={() => setActiveTab('enhance')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'enhance' ? '#6366f1' : 'transparent',
                color: activeTab === 'enhance' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Wand2 size={14} />
              <span>Enhance</span>
            </button>

            <button
              onClick={() => setActiveTab('analyze')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'analyze' ? '#6366f1' : 'transparent',
                color: activeTab === 'analyze' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Search size={14} />
              <span>Analyze</span>
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'ocr' ? '#6366f1' : 'transparent',
                color: activeTab === 'ocr' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <FileText size={14} />
              <span>OCR/Math</span>
            </button>

            <button
              onClick={() => setActiveTab('shapes')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'shapes' ? '#6366f1' : 'transparent',
                color: activeTab === 'shapes' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
              }}
            >
              <Shapes size={14} />
              <span>Shapes</span>
            </button>
          </div>

          {/* Content Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {/* TAB 1: ENHANCE */}
            {activeTab === 'enhance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Art Style Preset
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    {STYLE_PRESETS.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: selectedStyle === style ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                          background: selectedStyle === style ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: selectedStyle === style ? '#ffffff' : '#cbd5e1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
                    Creative Prompt (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A glowing futuristic space station..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  onClick={handleEnhance}
                  disabled={loading}
                  className="btn-primary"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  <span>{loading ? 'Enhancing with Gemini...' : 'Enhance Sketch'}</span>
                </button>

                {/* Enhanced Result Preview */}
                {enhanceResult && (
                  <div className="glass-panel" style={{ padding: '1rem', marginTop: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80' }}>Generated Artwork</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{enhanceResult.style}</span>
                    </div>
                    <img
                      src={enhanceResult.enhanced_image}
                      alt="AI Enhanced Result"
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.5rem' }}>{enhanceResult.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ANALYZE */}
            {activeTab === 'analyze' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn-primary"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  <span>{loading ? 'Analyzing Sketch...' : 'Analyze Sketch Structure'}</span>
                </button>

                {analysisResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysisResult.composition_rating && (
                      <div className="glass-panel" style={{ padding: '0.85rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Composition Rating</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>
                          {analysisResult.composition_rating} / 10
                        </span>
                      </div>
                    )}

                    {analysisResult.summary && (
                      <div className="glass-panel" style={{ padding: '0.85rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Summary</span>
                        <p style={{ fontSize: '0.85rem', color: '#f8fafc', lineHeight: 1.4 }}>{analysisResult.summary}</p>
                      </div>
                    )}

                    {analysisResult.suggestions && (
                      <div className="glass-panel" style={{ padding: '0.85rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>AI Suggestions</span>
                        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {analysisResult.suggestions.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: OCR & MATH */}
            {activeTab === 'ocr' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleOCR}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    <FileText size={16} />
                    <span>Extract Text</span>
                  </button>

                  <button
                    onClick={handleMath}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}
                  >
                    <Calculator size={16} />
                    <span>Solve Math</span>
                  </button>
                </div>

                {ocrResult && (
                  <div className="glass-panel" style={{ padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>Extracted Text</span>
                      <button
                        onClick={() => copyToClipboard(ocrResult.extracted_text)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {copied ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                      {ocrResult.extracted_text}
                    </p>
                  </div>
                )}

                {mathResult && (
                  <div className="glass-panel" style={{ padding: '1rem', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', display: 'block', marginBottom: '0.4rem' }}>
                      Mathematical Solution
                    </span>
                    {mathResult.equation && (
                      <p style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                        Equation: {mathResult.equation}
                      </p>
                    )}
                    <p style={{ fontSize: '0.85rem', color: '#f8fafc', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                      {mathResult.solution}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SHAPES */}
            {activeTab === 'shapes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={handleShapes}
                  disabled={loading}
                  className="btn-primary"
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Shapes size={18} />}
                  <span>Detect Geometric Shapes</span>
                </button>

                {shapeResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Detected {shapeResult.total_shapes} Shapes:
                    </span>
                    {shapeResult.shapes.map((s, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>{s.shape}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Vertices: {s.vertices} | Area: {s.area}px²
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
