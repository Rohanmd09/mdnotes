import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link2, CheckSquare, FolderGit2, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react'

function Section({ icon: Icon, title, items, linkedId, onLink, labelKey = 'title', badgeKey = null, badgeColors = {} }) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2 hover:text-white transition-colors"
      >
        <Icon className="w-3 h-3" />
        {title}
        {linkedId && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {open && (
        <div className="space-y-1 mb-4">
          {items.length === 0 ? (
            <p className="text-xs text-dark-muted italic px-1">None found</p>
          ) : items.map(item => {
            const isLinked = linkedId === item.id
            return (
              <button
                key={item.id}
                onClick={() => onLink(item.id)}
                className={`w-full text-left text-xs p-2 rounded-lg transition-colors flex items-start gap-2 group ${
                  isLinked
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                    : 'text-dark-text hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate">{item[labelKey]}</p>
                  {badgeKey && item[badgeKey] && (
                    <span className={`text-xs mt-0.5 inline-block px-1.5 py-0.5 rounded ${badgeColors[item[badgeKey]] || 'bg-dark-border text-dark-muted'}`}>
                      {item[badgeKey]}
                    </span>
                  )}
                </div>
                {isLinked && (
                  <X className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function MDOSLinker({ note, onLinkUpdate }) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [tasksRes, projectsRes, topicsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, status, priority').order('created_at', { ascending: false }).limit(30),
        supabase.from('projects').select('id, name, status').order('created_at', { ascending: false }).limit(20),
        supabase.from('topics').select('id, title, subject, completed').order('created_at', { ascending: false }).limit(40),
      ])
      if (tasksRes.data) setTasks(tasksRes.data)
      if (projectsRes.data) setProjects(projectsRes.data)
      if (topicsRes.data) setTopics(topicsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  if (!note) return null

  const link = (field, id) => {
    const newId = note[field] === id ? null : id
    onLinkUpdate(note.id, { [field]: newId })
  }

  const statusColors = {
    todo:       'bg-slate-500/20 text-slate-300',
    progress:   'bg-amber-500/20 text-amber-300',
    done:       'bg-emerald-500/20 text-emerald-300',
    Planning:   'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-amber-500/20 text-amber-300',
    Active:     'bg-blue-500/20 text-blue-300',
    Completed:  'bg-emerald-500/20 text-emerald-300',
  }

  return (
    <div className="w-60 border-l border-dark-border bg-dark-panel flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
          <Link2 className="w-4 h-4 text-brand-500" />
          MDOS Links
        </h3>
        <p className="text-xs text-dark-muted mt-0.5">Connect to tasks, projects & topics</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 bg-dark-border/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <Section
              icon={CheckSquare}
              title="Tasks"
              items={tasks}
              linkedId={note.linked_task_id}
              onLink={id => link('linked_task_id', id)}
              labelKey="title"
              badgeKey="status"
              badgeColors={statusColors}
            />
            <Section
              icon={FolderGit2}
              title="Projects"
              items={projects}
              linkedId={note.linked_project_id}
              onLink={id => link('linked_project_id', id)}
              labelKey="name"
              badgeKey="status"
              badgeColors={statusColors}
            />
            <Section
              icon={BookOpen}
              title="Topics"
              items={topics}
              linkedId={note.linked_topic_id}
              onLink={id => link('linked_topic_id', id)}
              labelKey="title"
              badgeKey="subject"
              badgeColors={{}}
            />
          </div>
        )}
      </div>
    </div>
  )
}
