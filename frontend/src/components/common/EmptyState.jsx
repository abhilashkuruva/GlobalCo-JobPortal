import React from 'react'

export default function EmptyState({ title, description, action }) {
  return (
    <div className="bb-empty">
      <div className="bb-empty__icon" aria-hidden>
        ▢
      </div>
      <div className="bb-empty__title">{title || 'Nothing here yet'}</div>
      {description ? <div className="bb-empty__desc">{description}</div> : null}
      {action ? <div className="bb-empty__action">{action}</div> : null}
    </div>
  )
}

