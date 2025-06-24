import React, { useEffect } from 'react';
import HtmlData from '../HtmlData/HtmlData';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';

const ConnectNotVerified = ({ id, step }: any) => {
  console.log('id', id);
  const { navigate } = useNavigation();

  useEffect(() => {
    const modal = document.getElementById('exampleModalToggle45');
    const handleModalClose = () => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style = '';
    };

    modal?.addEventListener('hidden.bs.modal', handleModalClose);

    return () => {
      modal?.removeEventListener('hidden.bs.modal', handleModalClose);
    };
  }, []);

  return (
    <div className="ad-dispute">
      <div
        className="modal fade"
        id="exampleModalToggle45"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel45"
        tabIndex={1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-content-center">
            <div className="modal-header">
              <h5 className="modal-title text-white" id="exampleModalToggleLabel45">
                Payment Method Required
              </h5>
              <button
                type="button"
                className="btn-close bg-light"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="card-body viewtask">
                <HtmlData
                  data={'Kindly connect your stripe account'}
                  className="text-white mb-4"
                />

                <div className="text-end mb-3" data-bs-dismiss="modal">
                  {step && id && (
                    <Link
                      className="btn rounded-pill btn-outline-info mx-1 my-1"
                      href={`/dashboard/tasks/${id}/add-proposal`}
                      onClick={() => navigate(`/dashboard/tasks/${id}/add-proposal`)}
                    >
                      Skip for Now
                    </Link>
                  )}
                  <Link
                    className="btn rounded-pill btn-outline-info mx-1 my-1"
                    href={'/dashboard/payments/information'}
                    onClick={() => navigate('/dashboard/payments/information')}
                  >
                    Ok
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectNotVerified;