// ═══════════════════════════════════════════════════════════════
// Genten — Graph Renderer (D3.js SVG)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import type { Note } from '../../../types/note'
import type { GraphFilter } from './index'

interface Props {
  filter: GraphFilter
  semanticThreshold: number
}

// Node colors defined by spec, matching light theme
const TYPE_COLORS: Record<string, string> = {
  study: '#4B7DD9',
  problem: '#C4752A',
  system_design: '#6B4CE7',
  diagram: '#2A7A72',
  canvas: '#B4525A',
  daily: '#8B8580',
  capture: '#6F6A62',
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string
  note: Note
  radius: number
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  type: 'explicit' | 'semantic'
  strength?: number
}

export function GraphRenderer({ filter, semanticThreshold }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const notes = useNotesStore(s => s.notes)
  const openNote = useNotesStore(s => s.openNote)
  const navigate = useUIStore(s => s.navigate)
  const showContextMenu = useUIStore(s => s.showContextMenu)

  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const allGraphData = useNotesStore.getState().getGraphData()

    // 1. Filter Nodes
    const filteredGraphNodes = allGraphData.nodes.filter(n => {
      if (filter === 'All') return true
      if (filter === 'Study') return n.note_type === 'study'
      if (filter === 'Problems') return n.note_type === 'problem'
      if (filter === 'Design') return n.note_type === 'system_design'
      if (filter === 'Diagrams') return n.note_type === 'diagram'
      return true
    })

    const nodeIds = new Set(filteredGraphNodes.map(n => n.id))

    // 2. Filter Links
    const links: GraphLink[] = allGraphData.links
      .filter(l => nodeIds.has(l.source as string) && nodeIds.has(l.target as string))
      .map(l => ({ 
        ...l, 
        source: l.source as string, 
        target: l.target as string, 
        type: l.link_type as 'explicit' | 'semantic' 
      } as GraphLink))

    // Node objects with size calculation: smaller particle-like sizes
    const linkCounts: Record<string, number> = {}
    links.forEach(l => {
      linkCounts[l.source as string] = (linkCounts[l.source as string] || 0) + 1
      linkCounts[l.target as string] = (linkCounts[l.target as string] || 0) + 1
    })

    const nodes: GraphNode[] = filteredGraphNodes.map(gn => ({
      id: gn.id,
      note: notes.find(n => n.id === gn.id)!,
      radius: Math.min(10, 3 + ((linkCounts[gn.id] || 0) * 0.8)),
    }))

    // 2. Setup SVG
    d3.select(containerRef.current).selectAll('*').remove()
    
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      // Double click empty space to add note
      .on('dblclick', (event) => {
        if (event.target.tagName === 'svg') {
          // Trigger new inline note input (simplified to opening editor for now)
          // In full implementation, this would spawn a floating input
          useNotesStore.getState().createNote('capture', 'New Idea').then(n => {
            openNote(n.id)
            navigate('editor')
          })
        }
      })
      // Right click context menu
      .on('contextmenu', (event) => {
        event.preventDefault()
        showContextMenu(
          event.clientX,
          event.clientY,
          [
            { label: 'New Note Here', action: () => {} },
            { label: 'Reset Zoom', action: () => {
              svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity)
            }},
          ]
        )
      })

    const g = svg.append('g')

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // 3. Setup Force Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as GraphNode).radius + 4).iterations(2))

    // 4. Render Edges
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'explicit' ? 'rgba(0,0,0,0.15)' : 'rgba(107,92,231,0.4)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'semantic' ? '4,4' : 'none')
      .attr('opacity', d => d.type === 'semantic' ? (d.strength || 0.5) : 1)

    // Tooltip div (Light Theme)
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'absolute pointer-events-none opacity-0 bg-white text-text-primary border border-border-subtle font-ui text-xs px-3 py-1.5 rounded shadow-sm transition-opacity z-50')

    // 5. Render Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => TYPE_COLORS[d.note.note_type] || TYPE_COLORS.capture!)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#0F0D0B').attr('stroke-width', 2)
        tooltip.transition().duration(200).style('opacity', 1)
        
        const tagsHtml = d.note.metadata.tags.length 
          ? `<div class="mt-1.5 flex flex-wrap gap-1">${d.note.metadata.tags.map(t => `<span class="bg-black/5 border border-black/10 px-1 rounded text-[9px] text-text-secondary">${t}</span>`).join('')}</div>`
          : ''

        const detailsHtml = `
          <div class="font-medium text-text-primary mb-1">${d.note.title || 'Untitled'}</div>
          <div class="text-[10px] text-text-tertiary flex flex-col gap-0.5">
            <span class="capitalize"><span class="font-medium">Type:</span> ${d.note.note_type.replace('_', ' ')}</span>
            <span><span class="font-medium">Words:</span> ${d.note.word_count}</span>
          </div>
          ${tagsHtml}
        `
        
        tooltip.html(detailsHtml)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#FFFFFF').attr('stroke-width', 1.5)
        tooltip.transition().duration(200).style('opacity', 0)
      })
      .on('click', (_, d) => {
        // Open preview panel
        openNote(d.id)
        useUIStore.getState().setActiveEditorTab('links')
        navigate('editor')
      })
      .call(d3.drag<any, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // 5.5 Render Labels
    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.note.title)
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('fill', '#4A4540')
      .attr('dx', d => d.radius + 4)
      .attr('dy', 3)
      .attr('pointer-events', 'none')
      .attr('opacity', 0.85)

    // 6. Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!)

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
        
      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [notes, filter, semanticThreshold, openNote, navigate, showContextMenu])

  return <div ref={containerRef} className="w-full h-full bg-transparent" />
}
