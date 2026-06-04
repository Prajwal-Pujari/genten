// ═══════════════════════════════════════════════════════════════
// Genten — System Design Default Edge
// ═══════════════════════════════════════════════════════════════

import { EdgeProps, getBezierPath, BaseEdge } from '@xyflow/react'

export function DefaultEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    selected,
  } = props

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 1.5,
        stroke: selected ? '#6B5CE7' : '#C4BDB0',
        transition: 'stroke 0.2s',
      }}
    />
  )
}
