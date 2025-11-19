'use client'

import { useState, useEffect } from 'react'
import { Check, Trophy, Flame, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getDateKey } from '@/lib/date-utils'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface FrogData {
  task: string
  completed: boolean
  streak: number
  lastCompletedDate: string | null
}

interface DailyFrog {
  [date: string]: {
    task: string
    completed: boolean
  }
}

export function EatThatFrog() {
  const [dailyFrogs, setDailyFrogs] = useLocalStorage<DailyFrog>('frog-daily', {})
  const [streakData, setStreakData] = useLocalStorage<{ count: number; lastDate: string | null }>('frog-streak', {
    count: 0,
    lastDate: null
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [newTask, setNewTask] = useState('')

  const today = getDateKey()
  const currentFrog = dailyFrogs[today] || { task: '', completed: false }

  // Check streak logic
  useEffect(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = getDateKey(yesterday)

    // If last completed date was before yesterday, reset streak
    if (streakData.lastDate && streakData.lastDate !== yesterdayKey && streakData.lastDate !== today) {
      setStreakData({ count: 0, lastDate: streakData.lastDate })
    }
  }, [streakData, setStreakData, today])

  const handleSaveFrog = () => {
    if (!newTask.trim()) return
    
    setDailyFrogs({
      ...dailyFrogs,
      [today]: { task: newTask, completed: false }
    })
    setIsEditing(false)
  }

  const handleComplete = () => {
    if (currentFrog.completed) return

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#15803d'] // Green shades
    })

    // Update task status
    setDailyFrogs({
      ...dailyFrogs,
      [today]: { ...currentFrog, completed: true }
    })

    // Update streak if not already completed today
    if (streakData.lastDate !== today) {
      setStreakData({
        count: streakData.count + 1,
        lastDate: today
      })
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
      {/* Streak Badge */}
      <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full font-bold animate-in fade-in slide-in-from-top-4">
        <Flame className="w-5 h-5 fill-current" />
        <span>{streakData.count} días seguidos comiendo el sapo</span>
      </div>

      {/* Main Card */}
      <div className="w-full bg-card border-2 border-green-100 dark:border-green-900 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🐸
            </div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">
              Tu Sapo del Día
            </h2>
            <p className="text-muted-foreground mt-2">
              "Si tienes que comer un sapo, hazlo a primera hora de la mañana y nada peor te pasará el resto del día."
            </p>
          </div>

          {!currentFrog.task || isEditing ? (
            <div className="space-y-4 max-w-md mx-auto animate-in zoom-in-95">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="¿Cuál es tu tarea más difícil hoy?"
                className="text-center text-lg h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveFrog()}
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                {isEditing && (
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                )}
                <Button 
                  onClick={handleSaveFrog} 
                  disabled={!newTask.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Definir Sapo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95">
              <div className={cn(
                "text-3xl font-bold p-6 rounded-xl border-2 transition-all",
                currentFrog.completed 
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  : "bg-card border-border"
              )}>
                {currentFrog.task}
              </div>

              {!currentFrog.completed ? (
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Check className="w-6 h-6 mr-2" />
                    ¡Me comí el sapo!
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setNewTask(currentFrog.task)
                      setIsEditing(true)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Cambiar tarea
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-green-600 dark:text-green-400 font-bold text-xl flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    ¡Excelente trabajo!
                  </div>
                  <p className="text-muted-foreground">
                    Has completado lo más difícil. El resto del día será pan comido.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
