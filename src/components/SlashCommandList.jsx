import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { SLASH_COMMANDS, ALL_COMMANDS } from './extensions/SlashCommand'

const SlashCommandList = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (item) => {
    if (item) command(item)
  }

  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex(i => (i + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex(i => (i + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(items[selectedIndex])
        return true
      }
      return false
    },
  }))

  if (!items.length) return null

  // Group remaining items by category
  const grouped = []
  SLASH_COMMANDS.forEach(cat => {
    const catItems = cat.items.filter(ci => items.find(i => i.id === ci.id))
    if (catItems.length) grouped.push({ category: cat.category, items: catItems })
  })

  return (
    <div className="slash-menu">
      {grouped.map(group => (
        <div key={group.category}>
          <div className="slash-menu-category">{group.category}</div>
          {group.items.map(item => {
            const flatIdx = items.indexOf(item)
            return (
              <button
                key={item.id}
                className={`slash-menu-item ${flatIdx === selectedIndex ? 'active' : ''}`}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setSelectedIndex(flatIdx)}
              >
                <div className="slash-menu-icon">{item.icon}</div>
                <div className="slash-menu-text">
                  <div className="slash-menu-title">{item.title}</div>
                  <div className="slash-menu-desc">{item.description}</div>
                </div>
                {item.shortcut && <div className="slash-menu-shortcut">{item.shortcut}</div>}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
})

SlashCommandList.displayName = 'SlashCommandList'
export default SlashCommandList
