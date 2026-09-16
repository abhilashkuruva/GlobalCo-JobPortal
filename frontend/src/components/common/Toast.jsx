import React, { useEffect } from 'react'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), toast.duration ?? 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  return (
    <div
      className={`bb-toast bb-toast--${toast.type || 'info'}`}
      role="status"
      aria-live="polite"
    >
      <div className="bb-toast__icon" aria-hidden>
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
      </div>
      <div className="bb-toast__body">
        <div className="bb-toast__title">{toast.title || 'Notice'}</div>
        {toast.message ? <div className="bb-toast__message">{toast.message}</div> : null}
      </div>
      <button className="bb-toast__close" onClick={() => onClose(toast.id)} aria-label="Close">
        ×
      </button>
    </div>
  )
}

