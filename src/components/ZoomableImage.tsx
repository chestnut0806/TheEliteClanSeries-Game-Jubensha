import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  className?: string;
  stopPropagation?: boolean;
}

export function ZoomableImage({ src, alt, className, stopPropagation = false }: Props) {
  const [open, setOpen] = useState(false);
  const touchRef = useRef<{ moved: boolean; timer: ReturnType<typeof setTimeout> | null }>({ moved: false, timer: null });

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  // On touchstart: prevent browser from generating click event on parent
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current.moved = false;
    if (stopPropagation) {
      e.stopPropagation();
      // preventDefault here prevents the browser from dispatching a click event
      e.preventDefault();
    }
  }, [stopPropagation]);

  // On touchmove: mark as moved (not a tap)
  const handleTouchMove = useCallback(() => {
    touchRef.current.moved = true;
  }, []);

  // On touchend: if it was a tap (not scroll), open zoom
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!touchRef.current.moved) {
      handleOpen();
    }
  }, [stopPropagation, handleOpen]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    handleOpen();
  }, [stopPropagation, handleOpen]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    // Prevent body scroll while zoomed
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        title="点击放大"
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      />

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              onTouchEnd={(e) => { e.preventDefault(); handleClose(); }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                  rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white
                  transition-colors text-xl"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="关闭"
              >
                ✕
              </button>

              <motion.img
                src={src}
                alt={alt}
                className="max-w-[95vw] max-h-[95vh] object-contain select-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
