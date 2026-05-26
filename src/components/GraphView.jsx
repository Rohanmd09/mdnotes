import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { supabase } from '../lib/supabase'

const COLORS = {
  default: '#8b5cf6',
  purple:  '#8b5cf6',
  blue:    '#3b82f6',
  green:   '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
}

export default function GraphView({ notes, activeNoteId, onSelectNote }) {
  const svgRef = useRef(null)
  const [links, setLinks] = useState([])
  const [hovered, setHovered] = useState(null)

  // Fetch note links
  useEffect(() => {
    supabase.from('note_links').select('source_note_id, target_note_id').then(({ data }) => {
      if (data) setLinks(data)
    })
  }, [])

  useEffect(() => {
    if (!svgRef.current || !notes.length) return
    const el = svgRef.current
    const W = el.clientWidth || 900
    const H = el.clientHeight || 600

    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el)
      .attr('width', W)
      .attr('height', H)

    // Gradient defs
    const defs = svg.append('defs')
    const radial = defs.append('radialGradient').attr('id', 'node-glow')
    radial.append('stop').attr('offset', '0%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 0.4)
    radial.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 0)

    // Zoom + pan
    const g = svg.append('g')
    svg.call(
      d3.zoom().scaleExtent([0.2, 3]).on('zoom', (e) => g.attr('transform', e.transform))
    )

    // Build node/link data
    const nodeMap = new Map(notes.map(n => [n.id, { ...n, id: n.id }]))
    const edgeData = links
      .filter(l => nodeMap.has(l.source_note_id) && nodeMap.has(l.target_note_id))
      .map(l => ({ source: l.source_note_id, target: l.target_note_id }))

    // Connection degree for sizing
    const degree = new Map()
    notes.forEach(n => degree.set(n.id, 0))
    edgeData.forEach(e => {
      degree.set(e.source, (degree.get(e.source) || 0) + 1)
      degree.set(e.target, (degree.get(e.target) || 0) + 1)
    })

    // Force simulation
    const sim = d3.forceSimulation(notes)
      .force('link', d3.forceLink(edgeData).id(d => d.id).distance(120).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(d => nodeRadius(d, degree) + 10))

    // Draw edges
    const link = g.append('g').selectAll('line')
      .data(edgeData).join('line')
      .attr('stroke', '#2A2A35')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.8)

    // Draw glows for active note
    g.append('g').selectAll('circle.glow')
      .data(notes).join('circle')
      .attr('class', 'glow')
      .attr('r', d => activeNoteId === d.id ? nodeRadius(d, degree) + 14 : 0)
      .attr('fill', 'url(#node-glow)')

    // Draw nodes
    const node = g.append('g').selectAll('circle.node')
      .data(notes).join('circle')
      .attr('class', 'node')
      .attr('r', d => nodeRadius(d, degree))
      .attr('fill', d => {
        const base = COLORS[d.color] || COLORS.default
        return activeNoteId === d.id ? '#fff' : base
      })
      .attr('stroke', d => activeNoteId === d.id ? COLORS[d.color] || COLORS.default : 'transparent')
      .attr('stroke-width', 2.5)
      .attr('cursor', 'pointer')
      .on('click', (_, d) => onSelectNote(d.id))
      .on('mouseover', (_, d) => setHovered(d))
      .on('mouseout', () => setHovered(null))
      .call(
        d3.drag()
          .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    // Labels
    const label = g.append('g').selectAll('text')
      .data(notes).join('text')
      .text(d => (d.title || 'Untitled').substring(0, 22))
      .attr('font-size', d => activeNoteId === d.id ? 12 : 10)
      .attr('fill', d => activeNoteId === d.id ? '#fff' : '#94A3B8')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeRadius(d, degree) + 14)
      .attr('pointer-events', 'none')
      .style('user-select', 'none')

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('cx', d => d.x).attr('cy', d => d.y)
      label.attr('x', d => d.x).attr('y', d => d.y)
      svg.select('g').selectAll('circle.glow')
        .attr('cx', d => d.x).attr('cy', d => d.y)
    })

    return () => sim.stop()
  }, [notes, links, activeNoteId])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-dark-bg relative">
      {/* Header */}
      <div className="px-6 py-3 border-b border-dark-border flex items-center gap-3 bg-dark-panel/60 shrink-0">
        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        <span className="text-sm font-medium text-white">Note Graph</span>
        <span className="text-xs text-dark-muted">{notes.length} notes · {links.length} connections</span>
        <span className="text-xs text-dark-muted ml-auto">Drag to pan · scroll to zoom · click node to open</span>
      </div>

      {/* D3 SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} width="100%" height="100%" className="block" />

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none bg-dark-panel border border-dark-border rounded-xl px-3 py-2 text-sm shadow-xl"
            style={{ top: 20, right: 20 }}
          >
            <p className="font-medium text-white">{hovered.title || 'Untitled'}</p>
            {(hovered.tags || []).length > 0 && (
              <p className="text-xs text-brand-400 mt-0.5">{hovered.tags.join(', ')}</p>
            )}
          </div>
        )}

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-dark-muted text-sm">Create some notes to see your graph</p>
          </div>
        )}
      </div>
    </div>
  )
}

function nodeRadius(d, degree) {
  const deg = degree.get(d.id) || 0
  return Math.max(6, Math.min(18, 7 + deg * 2.5))
}
