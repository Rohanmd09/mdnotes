import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return { suggestion: { char: '/', command: ({ editor, range, props }) => { props.command({ editor, range }) } } }
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })]
  },
})

export const SLASH_COMMANDS = [
  {
    category: 'Text',
    items: [
      { id: 'h1', title: 'Heading 1', description: 'Big bold section title', shortcut: '#', icon: 'H1',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run() },
      { id: 'h2', title: 'Heading 2', description: 'Medium section title', shortcut: '##', icon: 'H2',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run() },
      { id: 'h3', title: 'Heading 3', description: 'Small section title', shortcut: '###', icon: 'H3',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run() },
      { id: 'p', title: 'Text', description: 'Plain paragraph', shortcut: '', icon: 'P',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('paragraph').run() },
    ]
  },
  {
    category: 'Lists',
    items: [
      { id: 'bullet', title: 'Bullet List', description: 'Unordered list', shortcut: '-', icon: '•',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
      { id: 'ordered', title: 'Numbered List', description: 'Ordered list', shortcut: '1.', icon: '1.',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
      { id: 'todo', title: 'To-do List', description: 'Checkboxes for tasks', shortcut: '[]', icon: '☐',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
    ]
  },
  {
    category: 'Blocks',
    items: [
      { id: 'quote', title: 'Quote', description: 'Highlight a quote', shortcut: '>', icon: '"',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run() },
      { id: 'code', title: 'Code Block', description: 'Code with syntax highlighting', shortcut: '```', icon: '</>',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run() },
      { id: 'divider', title: 'Divider', description: 'A horizontal line', shortcut: '---', icon: '—',
        command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
    ]
  },
]

// Flat list for filtering
export const ALL_COMMANDS = SLASH_COMMANDS.flatMap(cat => cat.items)
