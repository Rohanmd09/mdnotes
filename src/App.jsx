import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import NoteList from './components/NoteList'
import Editor from './components/Editor'
import CanvasView from './components/CanvasView'
import GraphView from './components/GraphView'
import MDOSLinker from './components/MDOSLinker'
import AuthScreen from './components/AuthScreen'
import NoteHeader from './components/NoteHeader'
import { FileText, LayoutGrid, Share2, LogOut, PenLine, Layers } from 'lucide-react'

function extractTitle(html) {
  if (!html) return 'Untitled Note'
  const div = document.createElement('div')
  div.innerHTML = html
  const heading = div.querySelector('h1, h2, h3')
  if (heading?.textContent?.trim()) return heading.textContent.trim().substring(0, 60)
  return div.textContent?.trim().split('\n')[0].substring(0, 60) || 'Untitled Note'
}

const VIEWS = [
  { id: 'notes',  label: 'Notes',  Icon: FileText,   tip: 'Document editor' },
  { id: 'canvas', label: 'Canvas', Icon: Layers,      tip: 'FigJam-style canvas' },
  { id: 'graph',  label: 'Graph',  Icon: Share2,      tip: 'Obsidian-style note graph' },
]

export default function App() {
  const [session, setSession]         = useState(undefined)
  const [notes, setNotes]             = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [viewMode, setViewMode]       = useState('notes')
  const [loadingNotes, setLoadingNotes] = useState(false)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s ?? null))
    return () => subscription.unsubscribe()
  }, [])

  // Fetch notes
  useEffect(() => {
    if (!session) { setNotes([]); setActiveNoteId(null); return }
    fetchNotes()
  }, [session])

  const fetchNotes = async () => {
    setLoadingNotes(true)
    const { data } = await supabase.from('notes').select('*').order('updated_at', { ascending: false })
    if (data) { setNotes(data); setActiveNoteId(p => p || data[0]?.id || null) }
    setLoadingNotes(false)
  }

  // CRUD
  const handleCreateNote = async (type = 'document') => {
    const { data } = await supabase.from('notes').insert([{
      title: type === 'canvas' ? 'Untitled Canvas' : 'Untitled Note',
      content: '', tags: [], color: 'default',
      note_type: type, user_id: session.user.id,
    }]).select().single()
    if (data) {
      setNotes(p => [data, ...p])
      setActiveNoteId(data.id)
      setViewMode(type === 'canvas' ? 'canvas' : 'notes')
    }
  }

  const handleDeleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(p => p.filter(n => n.id !== id))
    setActiveNoteId(p => {
      if (p !== id) return p
      return notes.find(n => n.id !== id)?.id ?? null
    })
  }

  const handleUpdateContent = useCallback(async (html) => {
    if (!activeNoteId) return
    const title = extractTitle(html)
    setNotes(p => p.map(n => n.id === activeNoteId ? { ...n, content: html, title, updated_at: new Date().toISOString() } : n))
    await supabase.from('notes').update({ content: html, title, updated_at: new Date().toISOString() }).eq('id', activeNoteId)
  }, [activeNoteId])

  const handleSaveCanvas = useCallback(async (snapshot) => {
    if (!activeNoteId) return
    setNotes(p => p.map(n => n.id === activeNoteId ? { ...n, canvas_data: snapshot, updated_at: new Date().toISOString() } : n))
    await supabase.from('notes').update({ canvas_data: snapshot, updated_at: new Date().toISOString() }).eq('id', activeNoteId)
  }, [activeNoteId])

  const handleUpdateTags  = async (tags)   => { if (!activeNoteId) return; setNotes(p => p.map(n => n.id === activeNoteId ? { ...n, tags } : n)); await supabase.from('notes').update({ tags }).eq('id', activeNoteId) }
  const handleUpdateColor = async (color)  => { if (!activeNoteId) return; setNotes(p => p.map(n => n.id === activeNoteId ? { ...n, color } : n)); await supabase.from('notes').update({ color }).eq('id', activeNoteId) }
  const handleLinkUpdate  = async (id, up) => { setNotes(p => p.map(n => n.id === id ? { ...n, ...up } : n)); await supabase.from('notes').update(up).eq('id', id) }

  // Switch to canvas mode automatically when selecting a canvas note
  const handleSelectNote = (id) => {
    setActiveNoteId(id)
    const note = notes.find(n => n.id === id)
    if (note?.note_type === 'canvas') setViewMode('canvas')
    else setViewMode(v => v === 'graph' ? 'notes' : v)
  }

  // Loading
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center animate-pulse">
            <FileText className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-dark-muted text-sm">Loading MDOS…</p>
        </div>
      </div>
    )
  }

  if (!session) return <AuthScreen />

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-dark-text overflow-hidden">

      {/* ── Top navigation bar ── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-dark-border bg-dark-panel shrink-0 z-20">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-3 border-r border-dark-border">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <PenLine className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">MDNotes</span>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-0.5 bg-dark-bg rounded-lg p-0.5 border border-dark-border">
          {VIEWS.map(({ id, label, Icon, tip }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              title={tip}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-dark-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Note title in header when not in notes view */}
        {viewMode !== 'notes' && activeNote && (
          <span className="text-sm text-dark-muted truncate max-w-xs">
            {activeNote.title || 'Untitled'}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {session?.user?.email && (
            <span className="text-xs text-dark-muted hidden md:block">{session.user.email}</span>
          )}
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-xs text-dark-muted hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — hidden in graph view */}
        {viewMode !== 'graph' && (
          <NoteList
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={() => handleCreateNote('document')}
            onCreateCanvas={() => handleCreateNote('canvas')}
            onDeleteNote={handleDeleteNote}
            loading={loadingNotes}
          />
        )}

        {/* ── Notes editor view ── */}
        {viewMode === 'notes' && (
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {activeNote ? (
              <>
                <NoteHeader note={activeNote} onUpdateTags={handleUpdateTags} onUpdateColor={handleUpdateColor} />
                <div className="flex-1 overflow-hidden">
                  <Editor key={activeNote.id} note={activeNote} onChange={handleUpdateContent} />
                </div>
              </>
            ) : (
              <EmptyState onCreateNote={() => handleCreateNote('document')} />
            )}
          </main>
        )}

        {/* ── Canvas view ── */}
        {viewMode === 'canvas' && (
          <main className="flex-1 overflow-hidden flex flex-col">
            {activeNote ? (
              <CanvasView key={activeNote.id} note={activeNote} onSave={handleSaveCanvas} />
            ) : (
              <EmptyState onCreateNote={() => handleCreateNote('canvas')} label="Create a Canvas" />
            )}
          </main>
        )}

        {/* ── Graph view ── */}
        {viewMode === 'graph' && (
          <GraphView notes={notes} activeNoteId={activeNoteId} onSelectNote={(id) => { setActiveNoteId(id); setViewMode('notes') }} />
        )}

        {/* MDOS linker — only in notes view */}
        {viewMode === 'notes' && activeNote && (
          <MDOSLinker note={activeNote} onLinkUpdate={handleLinkUpdate} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ onCreateNote, label = 'New Note' }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-dark-muted">
      <div className="w-16 h-16 rounded-2xl bg-dark-panel border border-dark-border flex items-center justify-center">
        <FileText className="w-7 h-7 text-brand-500/60" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-dark-text">Nothing selected</p>
        <p className="text-xs mt-1">Pick a note from the sidebar or create a new one.</p>
      </div>
      <button onClick={onCreateNote} className="mt-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-xl transition-colors">
        + {label}
      </button>
    </div>
  )
}
