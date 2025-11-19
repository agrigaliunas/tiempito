'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getDateKey } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

interface PomodoroSettings {
  focusTime: number
  shortBreakTime: number
  longBreakTime: number
}

interface PomodoroData {
  completedToday: number
  lastDate: string
}

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoro-settings', {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
  })

  const [data, setData] = useLocalStorage<PomodoroData>('pomodoro-data', {
    completedToday: 0,
    lastDate: getDateKey(),
  })

  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playTick = useCallback(() => {
    return
  }, [soundEnabled])

  const playAlarm = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // Create a soft bell/chime sound
    const createChime = (freq: number, time: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.type = 'sine'
      osc.frequency.value = freq
      
      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(0.3, time + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 2)
      
      osc.start(time)
      osc.stop(time + 2)
    }

    createChime(523.25, now) // C5
    createChime(659.25, now + 0.2) // E5
    createChime(783.99, now + 0.4) // G5
  }, [soundEnabled])

  // Reset counter if it's a new day
  useEffect(() => {
    const today = getDateKey()
    if (data.lastDate !== today) {
      setData({ completedToday: 0, lastDate: today })
    }
  }, [data.lastDate, setData])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev % 1 === 0) playTick()
          return prev - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      playAlarm()
      if (mode === 'focus') {
        const newCompleted = data.completedToday + 1
        setData({ ...data, completedToday: newCompleted })
        
        // Suggest long break after 4 pomodoros
        if (newCompleted % 4 === 0) {
          setMode('longBreak')
          setTimeLeft(settings.longBreakTime * 60)
        } else {
          setMode('shortBreak')
          setTimeLeft(settings.shortBreakTime * 60)
        }
      } else {
        setMode('focus')
        setTimeLeft(settings.focusTime * 60)
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, mode, settings, data, setData])

  const handleStart = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
    setIsRunning(true)
  }
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(settings.focusTime * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = mode === 'focus' 
    ? (timeLeft / (settings.focusTime * 60)) * 100
    : mode === 'shortBreak'
    ? (timeLeft / (settings.shortBreakTime * 60)) * 100
    : (timeLeft / (settings.longBreakTime * 60)) * 100

  return (
    <div className="space-y-8">
      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className={cn(
                'transition-all duration-1000',
                mode === 'focus' ? 'text-red-500' : 'text-green-500'
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground mt-2 capitalize">
              {mode === 'focus' ? 'Enfoque' : mode === 'shortBreak' ? 'Descanso Corto' : 'Descanso Largo'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20">
              <Play className="w-5 h-5 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="secondary" className="shadow-sm">
              <Pause className="w-5 h-5 mr-2" />
              Pausar
            </Button>
          )}
          <Button onClick={handleReset} size="lg" variant="outline" className="shadow-sm">
            <RotateCcw className="w-5 h-5 mr-2" />
            Reiniciar
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-muted-foreground hover:text-foreground"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Sonido activado
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              Sonido desactivado
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-700 dark:text-red-400 px-6 py-3 rounded-full">
          <span className="text-2xl font-bold">{data.completedToday}</span>
          <span className="text-sm">pomodoros completados hoy</span>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <div className="space-y-2">
          <Label htmlFor="focus-time">Enfoque (min)</Label>
          <Input
            id="focus-time"
            type="number"
            min="1"
            value={settings.focusTime}
            onChange={(e) => setSettings({ ...settings, focusTime: parseInt(e.target.value) || 25 })}
            disabled={isRunning}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="short-break">Descanso Corto (min)</Label>
          <Input
            id="short-break"
            type="number"
            min="1"
            value={settings.shortBreakTime}
            onChange={(e) => setSettings({ ...settings, shortBreakTime: parseInt(e.target.value) || 5 })}
            disabled={isRunning}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="long-break">Descanso Largo (min)</Label>
          <Input
            id="long-break"
            type="number"
            min="1"
            value={settings.longBreakTime}
            onChange={(e) => setSettings({ ...settings, longBreakTime: parseInt(e.target.value) || 15 })}
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  )
}
