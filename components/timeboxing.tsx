'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { formatDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  date: string
}

interface TimeboxingData {
  [date: string]: TimeBlock[]
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
]

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6:00 to 23:00

export function Timeboxing() {
  const [data, setData] = useLocalStorage<TimeboxingData>('timeboxing-data', {})
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])

  const dateKey = formatDate(selectedDate)
  const blocks = data[dateKey] || []

  const handleSaveBlock = () => {
    if (!title.trim()) return
    
    // Validate times
    if (startTime >= endTime) {
      alert('La hora de fin debe ser mayor a la de inicio')
      return
    }

    const newBlock: TimeBlock = {
      id: editingBlock?.id || crypto.randomUUID(),
      title,
      startTime,
      endTime,
      color: selectedColor,
      date: dateKey,
    }

    if (editingBlock) {
      setData({
        ...data,
        [dateKey]: blocks.map(b => b.id === editingBlock.id ? newBlock : b),
      })
    } else {
      setData({
        ...data,
        [dateKey]: [...blocks, newBlock],
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setStartTime('09:00')
    setEndTime('10:00')
    setSelectedColor(COLORS[0])
    setEditingBlock(null)
    setIsDialogOpen(false)
  }

  const openNewBlockDialog = () => {
    setEditingBlock(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditBlockDialog = (block: TimeBlock) => {
    setEditingBlock(block)
    setTitle(block.title)
    setStartTime(block.startTime)
    setEndTime(block.endTime)
    setSelectedColor(block.color)
    setIsDialogOpen(true)
  }

  const deleteBlock = (id: string) => {
    setData({
      ...data,
      [dateKey]: blocks.filter(b => b.id !== id),
    })
  }

  const getBlockPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return ((hours - 6) + minutes / 60) * 60 // 60px per hour
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
          <div className="text-sm text-muted-foreground">
            {blocks.length} {blocks.length === 1 ? 'bloque' : 'bloques'} de tiempo
          </div>
        </div>
        <Button onClick={openNewBlockDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Bloque
        </Button>
      </div>

      {/* Timeline */}
      <div className="flex-1 border rounded-xl bg-card p-6 overflow-auto">
        <div className="flex gap-4 min-w-[600px]">
          {/* Hours column */}
          <div className="flex flex-col gap-0 w-16 flex-shrink-0">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[60px] flex items-start text-sm text-muted-foreground">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Timeline column */}
          <div className="flex-1 relative border-l">
            {/* Hour lines */}
            {HOURS.map((hour, index) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/50"
                style={{ top: `${index * 60}px` }}
              />
            ))}

            {/* Time blocks */}
            {blocks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((block) => {
                const top = getBlockPosition(block.startTime)
                const height = getBlockPosition(block.endTime) - top
                
                return (
                  <div
                    key={block.id}
                    className="absolute left-2 right-2 rounded-lg p-3 shadow-sm group cursor-pointer hover:shadow-md transition-all overflow-hidden"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: block.color + '20',
                      borderLeft: `4px solid ${block.color}`,
                    }}
                    onClick={() => openEditBlockDialog(block)}
                  >
                    <div className="flex items-start justify-between gap-2 h-full">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: block.color }}>
                          {block.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {block.startTime} - {block.endTime}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBlock(block.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}

            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                No hay bloques de tiempo para este día
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Editar Bloque' : 'Nuevo Bloque de Tiempo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="¿En qué trabajarás?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de inicio</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSaveBlock} disabled={!title.trim()}>
              {editingBlock ? 'Guardar Cambios' : 'Crear Bloque'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
