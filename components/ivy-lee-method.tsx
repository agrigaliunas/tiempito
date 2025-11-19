'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Check, ArrowDownToLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { formatDate, getDateKey } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

interface IvyLeeData {
  [date: string]: Task[]
}

export function IvyLeeMethod() {
  const [data, setData] = useLocalStorage<IvyLeeData>('ivylee-data', {})
  const [newTask, setNewTask] = useState('')
  
  const today = getDateKey()
  const tasks = data[today] || []
  
  // Get yesterday's incomplete tasks
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = formatDate(yesterday)
  const yesterdayTasks = data[yesterdayKey] || []
  const incompleteYesterdayTasks = yesterdayTasks.filter(t => !t.completed)

  const handleAddTask = () => {
    if (!newTask.trim()) return
    if (tasks.length >= 6) return

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask,
      completed: false,
      createdAt: Date.now(),
    }

    setData({
      ...data,
      [today]: [...tasks, task],
    })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    setData({
      ...data,
      [today]: tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    })
  }

  const deleteTask = (id: string) => {
    setData({
      ...data,
      [today]: tasks.filter(t => t.id !== id),
    })
  }

  const importYesterdayTasks = () => {
    const availableSlots = 6 - tasks.length
    if (availableSlots <= 0) return

    const tasksToImport = incompleteYesterdayTasks.slice(0, availableSlots).map(t => ({
      ...t,
      id: crypto.randomUUID(), // New ID for the new day
      createdAt: Date.now(),
    }))

    setData({
      ...data,
      [today]: [...tasks, ...tasksToImport],
    })
  }

  // Simple drag and drop implementation
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('index'))
    if (sourceIndex === targetIndex) return

    const newTasks = [...tasks]
    const [movedTask] = newTasks.splice(sourceIndex, 1)
    newTasks.splice(targetIndex, 0, movedTask)

    setData({
      ...data,
      [today]: newTasks,
    })
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      {/* Paper Card Effect */}
      <div className="bg-gradient-to-b from-white via-white to-slate-50 border border-slate-200 shadow-xl rounded-2xl p-8 flex-1 flex flex-col relative overflow-hidden">
        {/* Lined Paper Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#999 1px, transparent 1px)',
            backgroundSize: '100% 3rem',
            marginTop: '4rem',
          }}
        />

        {/* Header */}
        <div className="relative z-10 mb-8 text-center">
          <h3 className="font-serif text-2xl italic text-slate-700">
            Mis 6 Prioridades para Hoy
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Import Yesterday's Tasks */}
        {incompleteYesterdayTasks.length > 0 && tasks.length < 6 && (
          <div className="relative z-10 mb-6">
            <Button
              variant="outline"
              className="w-full border-dashed border-2 border-slate-300 hover:border-primary hover:text-primary transition-colors bg-white"
              onClick={importYesterdayTasks}
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Traer {incompleteYesterdayTasks.length} tareas pendientes de ayer
            </Button>
          </div>
        )}

        {/* Tasks List */}
        <div className="relative z-10 flex-1 space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                'group flex items-center gap-4 p-3 rounded-xl transition-all bg-white/90 shadow-sm hover:shadow-md hover:bg-slate-100 cursor-move',
                task.completed && 'opacity-70'
              )}
            >
              <div className="font-serif text-2xl font-bold text-muted-foreground/50 w-8 text-center">
                {index + 1}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    task.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>
                <span className={cn(
                  "text-lg font-medium transition-all text-slate-800",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Task Input */}
          {tasks.length < 6 ? (
            <div className="flex items-center gap-4 p-3 opacity-80 hover:opacity-100 transition-opacity bg-white/80 rounded-xl">
              <div className="font-serif text-2xl font-bold text-muted-foreground/30 w-8 text-center">
                {tasks.length + 1}
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Escribe una nueva tarea..."
                  className="border-0 border-b-2 border-slate-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-slate-800 placeholder:text-slate-400"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleAddTask}
                  disabled={!newTask.trim()}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-100/60 rounded-xl border border-dashed border-slate-300">
              Has alcanzado el límite de 6 tareas diarias del método Ivy Lee
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
