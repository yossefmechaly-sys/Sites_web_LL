'use client'

import React, { useEffect, useState } from 'react'

type Labels = { days: string; hours: string; minutes: string; seconds: string }

const split = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}

export function Countdown({ target, labels }: { target: string; labels: Labels }) {
  // Rendu serveur à zéro puis mise à jour côté client, pour éviter un écart d'hydratation.
  const [left, setLeft] = useState<ReturnType<typeof split> | null>(null)

  useEffect(() => {
    const end = new Date(target).getTime()
    const tick = () => setLeft(split(end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  const v = left ?? { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const items: [number, string][] = [
    [v.days, labels.days],
    [v.hours, labels.hours],
    [v.minutes, labels.minutes],
    [v.seconds, labels.seconds],
  ]

  return (
    <div className="countdown" role="timer">
      {items.map(([n, label]) => (
        <div key={label} className="countdown__item">
          <span className="countdown__value">{String(n).padStart(2, '0')}</span>
          <span className="countdown__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
