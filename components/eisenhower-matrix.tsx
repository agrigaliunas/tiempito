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

const QUADRANTS: { id: QuadrantId; title: string; subtitle: string; color: string; icon: any }[] = [
  {
    id: 'do',
    title: 'Hacer Ahora',
    subtitle: 'Urgente e Importante',
    color: 'bg-red-200 text-red-900 dark:bg-red-900/20 dark:text-red-400 border-red-300 dark:border-red-800',
    icon: AlertCircle,
  },
  {
    id: 'schedule',
    title: 'Planificar',
    subtitle: 'No Urgente pero Importante',
    color: 'bg-blue-200 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    icon: Calendar,
  },
  {
    id: 'delegate',
    title: 'Delegar',
    subtitle: 'Urgente pero No Importante',
    color: 'bg-amber-200 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    icon: ArrowRight,
  },
  {
    id: 'delete',
    title: 'Eliminar',
    subtitle: 'Ni Urgente ni Importante',
    color: 'bg-slate-200 text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 border-slate-300 dark:border-slate-700',
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
              'flex flex-col rounded-xl border-2 p-4 transition-colors',
              quadrant.color
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, quadrant.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <quadrant.icon className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">{quadrant.title}</h3>
                  <p className="text-xs opacity-80">{quadrant.subtitle}</p>
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
                    className="group bg-white dark:bg-black/20 p-3 rounded-lg shadow-sm border border-transparent hover:border-black/10 dark:hover:border-white/10 cursor-grab active:cursor-grabbing transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
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
