import { useEditor, EditorContent, BubbleMenu, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef } from 'react'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { SlashCommand, ALL_COMMANDS } from './extensions/SlashCommand'
import SlashCommandList from './SlashCommandList'

// ── Bubble toolbar button ──────────────────────────────────────────────────
function BBtn({ onClick, active, title, children }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 text-xs rounded transition-colors ${active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

// ── Top toolbar button ─────────────────────────────────────────────────────
function TBtn({ onClick, active, title, children }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-xs transition-colors ${active ? 'bg-brand-500/25 text-brand-300' : 'text-dark-muted hover:bg-white/8 hover:text-white'}`}
    >
      {children}
    </button>
  )
}

function Div() { return <div className="w-px h-4 bg-dark-border mx-0.5" /> }

// ── Slash command suggestion config ───────────────────────────────────────
function buildSuggestion() {
  return {
    items: ({ query }) =>
      ALL_COMMANDS.filter(i => i.title.toLowerCase().includes(query.toLowerCase())).slice(0, 12),

    render: () => {
      let component, popup

      return {
        onStart(props) {
          component = new ReactRenderer(SlashCommandList, { props, editor: props.editor })
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'mdnotes',
          })
        },
        onUpdate(props) {
          component.updateProps(props)
          popup[0]?.setProps({ getReferenceClientRect: props.clientRect })
        },
        onKeyDown(props) {
          if (props.event.key === 'Escape') { popup[0]?.hide(); return true }
          return component.ref?.onKeyDown?.(props) ?? false
        },
        onExit() {
          popup[0]?.destroy()
          component.destroy()
        },
      }
    },
  }
}

// ── Main Editor component ──────────────────────────────────────────────────
export default function Editor({ note, onChange }) {
  const saveTimer = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Type '/' for commands…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      CharacterCount,
      SlashCommand.configure({ suggestion: buildSuggestion() }),
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => onChange(editor.getHTML()), 500)
    },
    editorProps: { attributes: { class: 'prose-editor focus:outline-none' } },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const incoming = note?.content || ''
    if (editor.getHTML() !== incoming) editor.commands.setContent(incoming, false)
  }, [note?.id])

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  if (!editor) return null

  const words = editor.storage.characterCount?.words() ?? 0

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL', prev)
    if (url === null) return
    if (!url) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-col h-full bg-dark-bg">

      {/* ── Floating bubble menu on text selection ── */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120, placement: 'top' }}
        className="bubble-menu"
      >
        <BBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></BBtn>
        <BBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></BBtn>
        <BBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><s>S</s></BBtn>
        <BBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">H</BBtn>
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <BBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code"><code className="font-mono">`x`</code></BBtn>
        <BBtn onClick={setLink} active={editor.isActive('link')} title="Link">🔗</BBtn>
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <BBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">H1</BBtn>
        <BBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">H2</BBtn>
      </BubbleMenu>

      {/* ── Static toolbar ── */}
      <div className="px-5 py-1.5 border-b border-dark-border bg-dark-panel/60 flex items-center gap-0.5 flex-wrap shrink-0">
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold ⌘B"><b>B</b></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic ⌘I"><i>I</i></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><s>S</s></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">✦</TBtn>
        <Div />
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1">H1</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2">H2</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3">H3</TBtn>
        <Div />
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="To-do list">☐ Todo</TBtn>
        <Div />
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">❝</TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{`</>`}</TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">—</TBtn>
        <Div />
        <TBtn onClick={() => editor.chain().focus().undo().run()} title="Undo ⌘Z">↩</TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} title="Redo ⌘⇧Z">↪</TBtn>
        <div className="ml-auto flex items-center gap-3 text-xs text-dark-muted tabular-nums">
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <span className="text-dark-border">|</span>
          <span className="text-dark-muted/60">Type / for blocks</span>
        </div>
      </div>

      {/* ── Editor area ── */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}
