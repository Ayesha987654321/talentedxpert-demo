'use client';

import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Modal } from 'bootstrap';
import { useRouter } from 'next/navigation';
import React, { FC, useState } from 'react';
import { toast } from 'react-toastify';

interface RejectProposalProps {
  updateProposals: (status: string, reason: string) => void;
  id: number;
}

const RejectProposal: FC<RejectProposalProps> = ({ updateProposals, id }) => {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const handleSubmit = async () => {
    if (reason.trim() === '') {
      setError('Please fill the field');
      return;
    }

    setError('');
    updateProposals('REJECTED', reason);
    toast.success('PROPOSAL REJECTED');

    const modalElement = document.getElementById('exampleModalToggle97');
    if (modalElement) {
      let modalInstance = Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new Modal(modalElement);
      }
      modalInstance.hide();

      // Force cleanup in case Bootstrap doesn't
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((el) => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }, 300);
    }

    router.push(`/dashboard/tasks/${id}/proposals`);
  };

  return (
    <div className='ad-dispute'>
      <div
        className="modal fade"
        id="exampleModalToggle97"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel97"
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-content-center">
            <div className="modal-header">
              <h5 className="modal-title text-white" id="exampleModalToggleLabel2">
                Proposal Rejection
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                  Reason
                </label>
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
                {error && <small className="text-danger">{error}</small>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectProposal;
