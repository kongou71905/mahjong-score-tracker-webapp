import { useEffect, useRef, useState } from 'react';

export function usePinchTableScale() {
  const [tableScale, setTableScale] = useState<number>(1);
  const tableScaleRef = useRef<number>(1);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(
    null
  );

  useEffect(() => {
    tableScaleRef.current = tableScale;
  }, [tableScale]);

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;

    const clampScale = (val: number) => {
      const clamped = Math.min(1, Math.max(0.5, val));
      return clamped > 0.985 ? 1 : Number(clamped.toFixed(3));
    };

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          startDist: Math.max(getTouchDistance(e.touches), 1),
          startScale: tableScaleRef.current,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dist = getTouchDistance(e.touches);
        const nextScale = clampScale(
          pinchRef.current.startScale * (dist / pinchRef.current.startDist)
        );
        tableScaleRef.current = nextScale;
        setTableScale(nextScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null;
      }
    };

    const handleGestureEvent = (e: Event) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const nextScale = clampScale(
          tableScaleRef.current * (1 - e.deltaY * 0.005)
        );
        tableScaleRef.current = nextScale;
        setTableScale(nextScale);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    el.addEventListener('gesturestart', handleGestureEvent, { passive: false });
    el.addEventListener('gesturechange', handleGestureEvent, { passive: false });
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('gesturestart', handleGestureEvent);
      el.removeEventListener('gesturechange', handleGestureEvent);
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return { tableScale, setTableScale, tableWrapRef };
}
