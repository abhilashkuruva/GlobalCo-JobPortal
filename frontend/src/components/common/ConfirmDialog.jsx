import React from 'react'

export default function ConfirmDialog({ open, title, message, confirmText, cancelText, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="bb-modal-backdrop" role="dialog" aria-modal="true">
      <div className="bb-modal">
        <div className="bb-modal__head">
          <div className="bb-modal__title">{title || 'Confirm'}</div>
        </div>
        <div className="bb-modal__body">{message}</div>
        <div className="bb-modal__actions">
          <button className="btn" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button className="btn primary" onClick={onConfirm}>
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

