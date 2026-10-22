'use client'

import React, { useState } from 'react'

// Vignette légère : l'iframe YouTube n'est chargée qu'au clic.
export function YouTube({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false)
  if (play)
    return (
      <iframe
        className="yt"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  return (
    <button type="button" className="yt yt--poster" onClick={() => setPlay(true)} aria-label={title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="yt__title">{title}</span>
      <span className="yt__play" aria-hidden>
        <svg viewBox="0 0 68 48" width="68" height="48">
          <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.3.3 34 .3 34 .3s-21.3 0-26.6 1.4c-2.9.8-5.1 3.1-5.9 6C.1 13 .1 24 .1 24s0 11 1.4 16.3c.8 2.9 3 5.2 5.9 6C12.7 47.7 34 47.7 34 47.7s21.3 0 26.6-1.4c2.9-.8 5.1-3.1 5.9-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00" />
          <path d="M45 24 27 14v20" fill="#fff" />
        </svg>
      </span>
    </button>
  )
}
