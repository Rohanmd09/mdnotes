import { useState, useRef } from 'react'
import { Tag, X, Plus } from 'lucide-react'

const COLORS = [
  { key: 'default', label: 'None',   cls: 'bg-dark-muted/40' },
  { key: 'purple',  label: 'Purple', cls: 'bg-brand-500' },
  { key: 'blue',    label: 'Blue',   cls: 'bg-blue-500' },
  { key: 'green',   label: 'Green',  cls: 'bg-emerald-500' },
  { key: 'amber',   label: 'Amber',  cls: 'bg-amber-500' },
  { key: 'red',     label: 'Red',    cls: 'bg-red-500' },
]

export default function NoteHeader({ note, onUpdateTags, onUpdateColor }) {
  const [input, setInput] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const inputRef = useRef(null)
  const tags = note.tags || []

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag)) { setInput(''); return }
    onUpdateTags([...tags, tag])
    setInput('')
  }

  const removeTag = (tag) => {
    onUpdateTags(tags.filter(t => t !== tag))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1])
    }
  }

  const currentColor = COLORS.find(c => c.key === (note.color || 'default')) || COLORS[0]

  return (
    <div className="px-8 py-4 border-b border-dark-border bg-dark-bg/80 backdrop-blur sticky top-0 z-10">
      {/* Title row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Colour dot */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(v => !v)}
            title="Note colour"
            className={`w-3 h-3 rounded-full ${currentColor.cls} hover:ring-2 ring-white/30 transition-all shrink-0`}
          />
          {showColorPicker && (
            <div className="absolute top-6 left-0 bg-dark-panel border border-dark-border rounded-xl p-2 flex gap-1.5 z-20 shadow-xl">
              {COLORS.map(c => (
                <button
                  key={c.key}
                  title={c.label}
                  onClick={() => { onUpdateColor(c.key); setShowColorPicker(false) }}
                  className={`w-5 h-5 rounded-full ${c.cls} ${note.color === c.key ? 'ring-2 ring-white/60' : 'hover:ring-2 ring-white/30'} transition-all`}
                />
              ))}
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold text-white flex-1 truncate">
          {note.title || 'Untitled Note'}
        </h1>

        {/* Link badges */}
        <div className="flex gap-1.5 shrink-0">
          {note.linked_task_id && (
            <span className="text-xs px-2 py-0.5 bg-brand-500/15 text-brand-300 rounded-full border border-brand-500/25">Task</span>
          )}
          {note.linked_project_id && (
            <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/25">Project</span>
          )}
          {note.linked_topic_id && (
            <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/25">Topic</span>
          )}
        </div>
      </div>

      {/* Tags row */}
      <div className="flex items-center flex-wrap gap-1.5">
        <Tag className="w-3 h-3 text-dark-muted shrink-0" />
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-dark-panel border border-dark-border rounded-full text-dark-text group">
            {tag}
            <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 text-dark-muted hover:text-red-400 transition-all">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder="Add tag…"
            className="text-xs bg-transparent border-none outline-none text-dark-muted placeholder:text-dark-muted/40 w-20 focus:w-28 transition-all"
          />
        </div>
      </div>
    </div>
  )
}
