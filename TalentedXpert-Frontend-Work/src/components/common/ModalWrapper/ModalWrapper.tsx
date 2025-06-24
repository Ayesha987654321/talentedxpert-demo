'use client'
import React, { FC } from 'react'

const ModalWrapper: FC<any> = ({ modalId, title, subMsg, children, closeRef, handleClose }) => {

    return (
        <>
            <div className={"modal show fade"} id={modalId} tabIndex={-1} aria-hidden="true" aria-labelledby="accountModalLabel" aria-modal="true" role="dialog"
                style={{
                    display: "block",
                    // background: "rgba(0,0,0,0.5)"
                }}
            >
                <div className={`modal-dialog modal-dialog-centered`}>
                    <div className="modal-content modal-content-center">
                        <div className="modal-header mb-3">
                            <div className='bg-card-listing mx-0'>
                                <h5 className="modal-title text-white">{title}</h5>
                                {subMsg && <p className='text-center mt-3'>{subMsg}</p>}
                            </div>
                            <button ref={closeRef} className="btn-close bg-light" type="button" aria-label="Close" data-bs-dismiss="modal" onClick={() => handleClose()} />
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <div className={"modal-backdrop show fade"} />
        </>
    )
}

export default ModalWrapper