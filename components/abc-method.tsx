'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Filter, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

type Priority = 'A' | 'B' | 'C'

interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  completed: boolean
  createdAt: number
}

const PRIORITIES: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: 'A', label: 'Prioridad A', color: 'text-red-700 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800' },
  { value: 'B', label: 'Prioridad B', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800' },
  { value: 'C', label: 'Prioridad C', color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800' },
]

export function ABCMethod() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('abc-tasks', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('A')

  const handleSaveTask = () => {
    if (!title.trim()) return

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id 
        ? { ...t, title, description, priority } 
        : t
      ))
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        priority,
        completed: false,
        createdAt: Date.now(),
      }
      setTasks([...tasks, newTask])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('A')
    setEditingTask(null)
    setIsDialogOpen(false)
  }

  const openNewTaskDialog = () => {
    setEditingTask(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority)
    setIsDialogOpen(true)
  }

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = filterPriority === 'all' 
    ? tasks 
    : tasks.filter(t => t.priority === filterPriority)

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.priority !== b.priority) return a.priority.localeCompare(b.priority)
    return b.createdAt - a.createdAt
  })

  const stats = {
    A: tasks.filter(t => t.priority === 'A'),
    B: tasks.filter(t => t.priority === 'B'),
    C: tasks.filter(t => t.priority === 'C'),
  }

  const completionRate = stats.A.length > 0 
    ? Math.round((stats.A.filter(t => t.completed).length / stats.A.length) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {PRIORITIES.map((p) => (
          <div key={p.value} className={cn('rounded-xl p-4 border-2', p.bgColor)}>
            <div className={cn('text-3xl font-bold', p.color)}>
              {stats[p.value].length}
            </div>
            <div className={cn('text-sm font-medium', p.color)}>
              Tareas {p.value}
            </div>
          </div>
        ))}
        <div className="rounded-xl p-4 border-2 bg-primary/10 border-primary/30">
          <div className="text-3xl font-bold text-primary">
            {completionRate}%
          </div>
          <div className="text-sm font-medium text-primary">
            Completadas A
          </div>
        </div>
      </div>

      {/* Filter and Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterPriority} onValueChange={(v: Priority | 'all') => setFilterPriority(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="A">Solo A</SelectItem>
              <SelectItem value="B">Solo B</SelectItem>
              <SelectItem value="C">Solo C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNewTaskDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-2 overflow-y-auto border rounded-xl p-4 bg-card">
        {sortedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {filterPriority === 'all' ? 'No hay tareas' : `No hay tareas con prioridad ${filterPriority}`}
          </div>
        ) : (
          sortedTasks.map((task) => {
            const priorityInfo = PRIORITIES.find(p => p.value === task.priority)!
            
            return (
              <div
                key={task.id}
                className={cn(
                  'group flex items-start gap-3 p-4 rounded-lg border-2 transition-all',
                  priorityInfo.bgColor,
                  task.completed && 'opacity-50'
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskComplete(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      priorityInfo.bgColor,
                      priorityInfo.color
                    )}>
                      {task.priority}
                    </div>
                    <h4 className={cn(
                      'font-semibold flex-1',
                      task.completed && 'line-through'
                    )}>
                      {task.title}
                    </h4>
                  </div>
                  {task.description && (
                    <p className={cn(
                      'text-sm text-muted-foreground mt-1',
                      task.completed && 'line-through'
                    )}>
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditTaskDialog(task)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Dialog */}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-lg border-2 font-bold transition-all',
                      priority === p.value
                        ? cn(p.bgColor, p.color)
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {p.value}
                  </button>
                ))}
              </div>
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
