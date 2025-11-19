'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Trash2, Edit2, AlertCircle, Calendar, ArrowRight, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

type QuadrantId = 'do' | 'schedule' | 'delegate' | 'delete'

interface Task {
  id: string
  title: string
  description?: string
  quadrant: QuadrantId
  createdAt: number
}

const QUADRANTS: {
  id: QuadrantId
  title: string
  subtitle: string
  color: string
  icon: any
  accent: string
}[] = [
  {
    id: 'do',
    title: 'Hacer Ahora',
    subtitle: 'Urgente e Importante',
    color:
      'bg-white/95 text-slate-900 border-2 border-green-100 shadow-[0_25px_65px_-35px_rgba(239,68,68,0.8)] dark:bg-green-950/30 dark:border-green-900 dark:shadow-green-950/50',
    accent: 'text-green-500 dark:text-green-200',
    icon: AlertCircle,
  },
  {
    id: 'schedule',
    title: 'Planificar',
    subtitle: 'No Urgente pero Importante',
    color:
      'bg-white/95 text-slate-900 border-2 border-orange-100 shadow-[0_25px_65px_-35px_rgba(59,130,246,0.55)] dark:bg-orange-950/30 dark:border-orange-900 dark:shadow-orange-950/40',
    accent: 'text-orange-500 dark:text-orange-200',
    icon: Calendar,
  },
  {
    id: 'delegate',
    title: 'Delegar',
    subtitle: 'Urgente pero No Importante',
    color:
      'bg-white/95 text-blue-900 border-2 border-blue-100 shadow-[0_25px_65px_-35px_rgba(245,158,11,0.6)] dark:bg-blue-950/30 dark:border-blue-900 dark:shadow-blue-950/40',
    accent: 'text-blue-500 dark:text-blue-200',
    icon: ArrowRight,
  },
  {
    id: 'delete',
    title: 'Eliminar',
    subtitle: 'Ni Urgente ni Importante',
    color:
      'bg-white/95 text-red-900 border-2 border-red-200 shadow-[0_25px_65px_-35px_rgba(100,116,139,0.55)] dark:bg-red-900/40 dark:border-red-700 dark:shadow-red-900/40',
    accent: 'text-red-500 dark:text-red-200',
    icon: XCircle,
  },
]

export function EisenhowerMatrix() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('eisenhower-tasks', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskQuadrant, setNewTaskQuadrant] = useState<QuadrantId>('do')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSaveTask = () => {
    if (!title.trim()) return

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title, description } : t))
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        quadrant: newTaskQuadrant,
        createdAt: Date.now(),
      }
      setTasks([...tasks, newTask])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setEditingTask(null)
    setIsDialogOpen(false)
  }

  const openNewTaskDialog = (quadrant: QuadrantId) => {
    setNewTaskQuadrant(quadrant)
    setEditingTask(null)
    setTitle('')
    setDescription('')
    setIsDialogOpen(true)
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setNewTaskQuadrant(task.quadrant)
    setIsDialogOpen(true)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetQuadrant: QuadrantId) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    
    if (taskId) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, quadrant: targetQuadrant } : t))
    }
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[600px]">
        {QUADRANTS.map((quadrant) => (
          <div
            key={quadrant.id}
            className={cn(
              'flex flex-col rounded-2xl p-5 transition-colors backdrop-blur-sm',
              quadrant.color
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, quadrant.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <quadrant.icon className={cn('w-5 h-5', quadrant.accent)} />
                <div>
                  <h3 className="font-bold text-base tracking-wide text-slate-900 ">
                    {quadrant.title}
                  </h3>
                  <p className="text-xs text-slate-600 ">{quadrant.subtitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => openNewTaskDialog(quadrant.id)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto min-h-[100px]">
              {tasks
                .filter((t) => t.quadrant === quadrant.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="group bg-white/95 dark:bg-slate-900/40 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditTaskDialog(task)}>
                            <Edit2 className="w-3 h-3 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.quadrant === quadrant.id).length === 0 && (
                <div className="h-full flex items-center justify-center text-xs opacity-40 border-2 border-dashed border-current/20 rounded-lg m-2">
                  Arrastra tareas aquí
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="¿Qué necesitas hacer?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                placeholder="Detalles adicionales..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSaveTask} disabled={!title.trim()}>
              {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
