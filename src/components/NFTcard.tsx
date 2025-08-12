import "../index.css";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export interface ChromaItem {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  price?: string;
  onBuy?: () => void;
  isLoading?: boolean;
  isPurchased?: boolean;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

type SetterFn = (v: number | string) => void;

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as SetterFn;
    setY.current = gsap.quickSetter(el, "--y", "px") as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{
        '--r': `${radius}px`,
        '--cols': columns,
        '--rows': rows,
      } as React.CSSProperties}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items?.map((c, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          style={{
            '--card-border': c.borderColor || 'transparent',
            '--card-gradient': c.gradient,
          } as React.CSSProperties}
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
            {c.price && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: '#10B981' 
              }}>
                {c.price} ETH
              </div>
            )}
            {c.onBuy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!c.isLoading && !c.isPurchased) {
                    c.onBuy?.();
                  }
                }}
                disabled={c.isLoading || c.isPurchased}
                className="buy-btn"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 1.2rem',
                  background: c.isPurchased 
                    ? 'linear-gradient(135deg, #6B7280, #4B5563)' 
                    : c.isLoading 
                      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                      : 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: c.isLoading || c.isPurchased ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%',
                  fontSize: '0.95rem',
                  boxShadow: c.isPurchased 
                    ? '0 2px 8px rgba(107, 114, 128, 0.3)'
                    : c.isLoading 
                      ? '0 2px 8px rgba(245, 158, 11, 0.3)'
                      : '0 2px 8px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!c.isLoading && !c.isPurchased) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!c.isLoading && !c.isPurchased) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                  }
                }}
              >
                {c.isPurchased ? (
                  <>
                    <span>✓</span>
                    <span>Purchased</span>
                  </>
                ) : c.isLoading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="32"
                        strokeDashoffset="32"
                        opacity="0.3"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Minting...</span>
                  </>
                ) : (
                  <>
                    <span>🛒</span>
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            )}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
