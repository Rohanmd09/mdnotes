import { useState } from 'react'
import { Plus, Search, Trash2, FileText, Tag, Layers, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const COLOR_MAP = {
  default: 'bg-white/20',
  purple:  'bg-brand-500',
  blue:    'bg-blue-500',
  green:   'bg-emerald-500',
  amber:   'bg-amber-500',
  red:     'bg-red-500',
}

export default function NoteList({ notes, activeNoteId, onSelectNote, onCreateNote, onCreateCanvas, onDeleteNote, loading }) {
  const [search, setSearch] = useState('')
  const [showNewMenu, setShowNewMenu] = useState(false)

  const filtered = notes.filter(n => {
    const q = search.toLowerCase()
    return n.title?.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q))
  })

  return (
    <div className="w-60 border-r border-dark-border bg-dark-panel flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-dark-border">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Notes
            <span className="font-normal text-dark-muted/60">({notes.length})</span>
          </span>

          {/* New note dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(v => !v)}
              className="flex items-center gap-0.5 p-1.5 rounded-lg bg-brand-500/15 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 top-8 bg-dark-panel border border-dark-border rounded-xl shadow-xl z-30 w-40 py-1 overflow-hidden">
                <button onClick={() => { onCreateNote(); setShowNewMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-text hover:bg-white/5 transition-colors">
                  <FileText className="w-3.5 h-3.5 text-brand-400" /> New Note
                </button>
                <button onClick={() => { onCreateCanvas(); setShowNewMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-text hover:bg-white/5 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> New Canvas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-dark-muted" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes & tags…"
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 transition-colors placeholder:text-dark-muted/40"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white text-xs">✕</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-px" onClick={() => setShowNewMenu(false)}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-dark-border/30 animate-pulse m-1" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-dark-muted italic py-6">
            {search ? 'No notes match.' : 'No notes yet.'}
          </p>
        ) : filtered.map(note => (
          <NoteItem key={note.id} note={note} isActive={activeNoteId === note.id}
            onSelect={() => onSelectNote(note.id)} onDelete={() => onDeleteNote(note.id)} />
        ))}
      </div>
    </div>
  )
}

function NoteItem({ note, isActive, onSelect, onDelete }) {
  const dotCls = COLOR_MAP[note.color] || COLOR_MAP.default
  const tags = (note.tags || []).slice(0, 2)
  const isCanvas = note.note_type === 'canvas'

  return (
    <div
      onClick={onSelect}
      className={`group flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-white/4 border border-transparent'
      }`}
    >
      <div className="pt-1 shrink-0 flex flex-col items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${dotCls}`} />
        {isCanvas && <Layers className="w-2.5 h-2.5 text-blue-400/70" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className={`text-xs font-medium truncate leading-tight ${isActive ? 'text-brand-300' : 'text-dark-text'}`}>
            {note.title || 'Untitled'}
          </p>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-dark-muted hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-dark-muted/60 mt-0.5 tabular-nums">
          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </p>

        {tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.map(t => (
              <span key={t} className="text-xs px-1.5 py-px bg-brand-500/8 text-brand-400/80 rounded border border-brand-500/15 flex items-center gap-0.5">
                <Tag className="w-2 h-2" />{t}
              </span>
            ))}
            {note.tags.length > 2 && <span className="text-xs text-dark-muted/50">+{note.tags.length - 2}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
