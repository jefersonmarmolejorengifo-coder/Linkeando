'use client'

import { useEffect, useRef, useState } from 'react'

const BAR_HEIGHTS = [
  0.3, 0.6, 0.9, 0.5, 0.8, 0.4, 0.7, 1, 0.6, 0.3, 0.8, 0.5,
  0.9, 0.4, 0.6, 0.7, 0.3, 0.8, 0.5, 1, 0.6, 0.4, 0.9, 0.7,
]

type Props = {
  src: string | null
  durationSec: number
  isMine?: boolean
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function VoiceBubble({ src, durationSec, isMine = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      if (!audio.duration || !isFinite(audio.duration)) return
      setProgress((audio.currentTime / audio.duration) * 100)
      setElapsed(audio.currentTime)
    }
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
      setElapsed(0)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio || !src) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const bgClass = isMine ? 'bg-verde-500' : 'bg-white border border-borde'
  const barBaseClass = isMine ? 'bg-white/30' : 'bg-verde-500/30'
  const barActiveClass = isMine ? 'bg-white' : 'bg-verde-500'
  const textClass = isMine ? 'text-white' : 'text-gray-900'
  const btnClass = isMine ? 'bg-white text-verde-500' : 'bg-verde-500 text-white'

  return (
    <div className={`rounded-2xl px-3 py-2.5 flex items-center gap-3 ${bgClass}`} style={{ minWidth: 200 }}>
      <button
        type="button"
        onClick={toggle}
        disabled={!src}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 ${btnClass}`}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex items-end gap-0.5 h-6 flex-1">
        {BAR_HEIGHTS.map((h, i) => {
          const pct = (i / BAR_HEIGHTS.length) * 100
          const active = progress >= pct
          return (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-colors ${active ? barActiveClass : barBaseClass}`}
              style={{ height: `${h * 100}%` }}
            />
          )
        })}
      </div>

      <span className={`text-xs font-mono ${textClass}`}>
        {fmt(playing || elapsed > 0 ? elapsed : durationSec)}
      </span>

      {src && <audio ref={audioRef} src={src} preload="metadata" />}
    </div>
  )
}
