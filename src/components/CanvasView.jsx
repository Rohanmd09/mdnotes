import { useCallback, useEffect, useRef } from 'react'
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

export default function CanvasView({ note, onSave }) {
  const saveTimer = useRef(null)
  const editorRef = useRef(null)

  const handleMount = useCallback((editor) => {
    editorRef.current = editor

    // Load saved canvas state
    if (note?.canvas_data) {
      try {
        editor.loadSnapshot(note.canvas_data)
      } catch (e) {
        console.warn('Could not restore canvas snapshot:', e)
      }
    }

    // Debounce save on any change
    const unsub = editor.store.listen(() => {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const snapshot = editor.getSnapshot()
        onSave(snapshot)
      }, 800)
    }, { source: 'user', scope: 'document' })

    return () => unsub()
  }, [note?.id]) // only re-mount when note switches

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  return (
    <div className="flex-1 relative" style={{ height: '100%' }}>
      <Tldraw
        onMount={handleMount}
        inferDarkMode
        hideUi={false}
      />
    </div>
  )
}
