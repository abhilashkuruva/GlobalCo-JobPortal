import React, { useCallback } from 'react'
import Toast from './Toast'

export default function ToastContainer({ toasts, setToasts }) {
  const onClose = useCallback(
    (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    },
    [setToasts],
  )

  return (
    <div className="bb-toast-stack" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  )
}

