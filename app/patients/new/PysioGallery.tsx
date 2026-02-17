"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "./new.module.css";

type Props = {
  images: { src: string; alt?: string }[];
  intervalMs?: number; // وقت التقليب
};

export default function PhysioGallery({ images, intervalMs = 3500 }: Props) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [i, setI] = useState(0);

  const hasMany = safeImages.length > 1;

  useEffect(() => {
    if (!hasMany) return;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [hasMany, safeImages.length, intervalMs]);

  if (safeImages.length === 0) return null;

  const prev = () => setI((x) => (x - 1 + safeImages.length) % safeImages.length);
  const next = () => setI((x) => (x + 1) % safeImages.length);

  const current = safeImages[i];

  return (
    <div className={styles.galleryWrap}>
      <div className={styles.galleryBox}>
        <Image
          src={current.src}
          alt={current.alt ?? "Physio"}
          fill
          sizes="(max-width: 900px) 92vw, 900px"
          className={styles.galleryImg}
          priority={false}
        />

        {hasMany && (
          <>
            <button type="button" className={styles.galleryBtnLeft} onClick={prev} aria-label="Prev">
              ‹
            </button>
            <button type="button" className={styles.galleryBtnRight} onClick={next} aria-label="Next">
              ›
            </button>

            <div className={styles.galleryDots}>
              {safeImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.galleryDot} ${idx === i ? styles.galleryDotActive : ""}`}
                  onClick={() => setI(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}