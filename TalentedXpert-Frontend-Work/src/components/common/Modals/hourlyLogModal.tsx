'use client'
import HoursHistory from '@/components/dashboardComponents/viewTasks/HoursHistory'
import React, { useEffect, useRef } from 'react'

const HourlyLogModal = ({ task, weekIndex }: any) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Trap focus inside the modal
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
      if (e.key === 'Escape') {
        // Prevent escape from closing parent modal
        e.stopPropagation()
      }
    }

    modal.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      modal.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Handle modal close to restore parent modal
  const handleClose = () => {
    const parentModal = document.getElementById('exampleHiredProposal')
    const childModal = document.getElementById('exampleModalToggle555')
    if (parentModal && childModal) {
      childModal.classList.remove('show')
      childModal.style.display = 'none'
      parentModal.classList.add('show')
      parentModal.style.display = 'block'
      parentModal.removeAttribute('aria-hidden')
      parentModal.focus()
    }
  }

  return (
    <form>
      <div className='ad-dispute'>
        <div
          className="modal fade"
          id="exampleModalToggle555"
          aria-labelledby="exampleModalToggleLabe555"
          tabIndex={-1}
          ref={modalRef}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
            <div className="modal-content modal-content-center">
              <div className="modal-header">
                <h5 className="modal-title text-white" id="exampleModalToggleLabel555">Hours</h5>
                <button
                  type="button"
                  className="btn-close bg-light"
                  onClick={handleClose} // Custom close handler
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <HoursHistory HoursHistory={task?.weeklyMilestones} milestoneIndex={Number(weekIndex)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default HourlyLogModal