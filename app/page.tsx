'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { PomodoroTimer } from '@/components/pomodoro-timer'
import { EisenhowerMatrix } from '@/components/eisenhower-matrix'
import { Timeboxing } from '@/components/timeboxing'
import { ABCMethod } from '@/components/abc-method'
import { IvyLeeMethod } from '@/components/ivy-lee-method'
import { EatThatFrog } from '@/components/eat-that-frog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

const techniques = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: 'Maximiza tu productividad trabajando en bloques de 25 minutos de enfoque intenso seguidos de 5 minutos de descanso. Ideal para evitar el agotamiento mental y mantener la concentración.',
    component: PomodoroTimer,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'eisenhower',
    name: 'Matriz de Eisenhower',
    description: 'Toma decisiones estratégicas clasificando tus tareas en cuatro cuadrantes según su urgencia e importancia. Te ayuda a decidir qué hacer ahora, qué planificar, qué delegar y qué eliminar.',
    component: EisenhowerMatrix,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'timeboxing',
    name: 'Timeboxing',
    description: 'Recupera el control de tu agenda asignando bloques de tiempo fijos y realistas para cada actividad. Evita la Ley de Parkinson y asegura que dediques tiempo a lo que realmente importa.',
    component: Timeboxing,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'abc',
    name: 'Método ABC',
    description: 'Jerarquiza tu lista de pendientes asignando prioridades: (A) Críticas e imperativas, (B) Importantes pero no vitales, y (C) Deseables. Asegura que siempre trabajes en lo de mayor impacto.',
    component: ABCMethod,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    id: 'ivylee',
    name: 'Ivy Lee',
    description: 'Simplifica tu día al máximo: al final de cada jornada, elige las 6 tareas más importantes para mañana y ordénalas por prioridad. Empieza por la primera y no pases a la siguiente hasta terminarla.',
    component: IvyLeeMethod,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
  {
    id: 'frog',
    name: 'Eat That Frog',
    description: 'Vence la procrastinación atacando tu tarea más difícil, fea e importante ("la rana") a primera hora de la mañana. Una vez hecha, el resto del día será pan comido.',
    component: EatThatFrog,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const activeTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(activeTheme === 'light' ? 'dark' : 'light')
  }

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? techniques.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === techniques.length - 1 ? 0 : prev + 1))
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              TP
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              TimePlay
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              Tu suite de productividad personal
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted"
            >
              {activeTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Pills */}
      <div className="container mx-auto px-4 py-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center md:justify-center gap-2 min-w-max px-2">
          {techniques.map((technique, index) => (
            <button
              key={technique.id}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap',
                'hover:scale-105',
                currentIndex === index
                  ? cn('shadow-lg ring-2 ring-offset-2 ring-offset-background', technique.bgColor, technique.color, 'ring-current')
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {technique.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pb-12 flex-1 flex flex-col">
        <div className="relative flex-1 flex flex-col max-w-6xl mx-auto w-full">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 bg-background border rounded-full p-3 shadow-lg hover:bg-muted transition-all hover:scale-110 text-muted-foreground hover:text-foreground"
            aria-label="Técnica anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 bg-background border rounded-full p-3 shadow-lg hover:bg-muted transition-all hover:scale-110 text-muted-foreground hover:text-foreground"
            aria-label="Siguiente técnica"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Content Card */}
          <div className="flex-1 bg-card border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-300">
            {/* Card Header */}
            <div className="p-6 md:p-8 border-b bg-muted/10 transition-colors duration-300">
              <div className="flex items-center justify-between mb-2">
                <h2 className={cn("text-2xl md:text-3xl font-bold transition-colors duration-300", techniques[currentIndex].color)}>
                  {techniques[currentIndex].name}
                </h2>
                {/* Mobile Navigation Arrows */}
                <div className="flex md:hidden gap-2">
                  <button onClick={goToPrevious} className="p-2 rounded-full hover:bg-muted">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={goToNext} className="p-2 rounded-full hover:bg-muted">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {techniques[currentIndex].description}
              </p>
            </div>

            {/* Technique Component Container */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden relative bg-card transition-colors duration-300">
              {techniques.map((technique, index) => {
                const Component = technique.component
                return (
                  <div
                    key={technique.id}
                    className={cn(
                      "h-full w-full absolute inset-0 p-4 md:p-8 overflow-y-auto transition-all duration-500",
                      index === currentIndex 
                        ? "opacity-100 translate-x-0 z-10" 
                        : index < currentIndex 
                          ? "opacity-0 -translate-x-8 pointer-events-none" 
                          : "opacity-0 translate-x-8 pointer-events-none"
                    )}
                    aria-hidden={index !== currentIndex}
                  >
                    <Component />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-muted/10 transition-colors duration-300">
        <p>TimePlay - Tus datos se guardan localmente en tu navegador</p>
      </footer>
    </div>
  )
}
