'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

// Diaporama du bandeau (remplace Slider Revolution) : fondu enchaîné, flèches, défilement auto.
export function HeroSlider({ slides, alt }: { slides: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(id)
  }, [slides.length, index])

  return (
    <section className="hero" aria-roledescription="carousel">
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === index ? alt : ''}
          aria-hidden={i !== index}
          className={`hero__img ${i === index ? 'is-active' : ''}`}
          fill
          sizes="100vw"
          // Première photo prioritaire (élément principal de la page) ; les suivantes en différé
          priority={i === 0}
          loading={i === 0 ? undefined : 'lazy'}
        />
      ))}
      <p className="hero__watermark" aria-hidden>
        Jerusalem
        <br />
        Footballclub
      </p>
      {slides.length > 1 && (
        <>
          <button type="button" className="hero__arrow hero__arrow--prev" onClick={() => go(-1)} aria-label="Previous">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" className="hero__arrow hero__arrow--next" onClick={() => go(1)} aria-label="Next">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </section>
  )
}
