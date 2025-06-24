'use client'
import React, { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RootState, useAppDispatch } from '@/store/Store';
import { useSelector } from 'react-redux';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import dynamic from 'next/dynamic';
import HtmlData from '@/components/common/HtmlData/HtmlData';
import MsgNotifier from '@/components/common/MsgNotifier/MsgNotifier';
import { toast } from 'react-toastify';
import { useNavigation } from '@/hooks/useNavigation';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import GlobalLoader from '../GlobalLoader/GlobalLoader';

// Define the style object with React.CSSProperties type
const scrollableContainerStyle: React.CSSProperties = {
  maxHeight: '300px',
  overflowY: 'auto',
  padding: '10px',
  borderRadius: '4px',
  width: '100%',
  minHeight: '250px', // Ensure consistent height during loading
};

const QuillEditor = dynamic(
  () => import('@/components/common/TextEditor/TextEditor'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: '250px',
          width: '100%',
          background: '#2a2a2a', // Match editor background
          borderRadius: '4px',
          display: 'block',
        }}
      ></div>
    ), // Improved placeholder to match editor size
  }
);

const Contract: FC<any> = ({ proposalId, taskId, taskStatus, isOpen, onClose, task }) => {
  const [editorTxt, setEditorTxt] = useState('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [msgNotify, setMsgNotify] = useState<boolean>(false);
  const [buttonsShow, setButtonsShow] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [contractDecesion, setContractDecesion] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [contractLoading, setContractLoading] = useState<boolean>(true);
  const [proposal, setProposal] = useState<any>({});
  const [contracts, setContracts] = useState<any>({});
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { navigate } = useNavigation();

  const contractData = {
    proposalId: Number(proposalId),
    terms: editorTxt ? editorTxt : contracts.terms,
    totalAmount: 0,
    isTEApproved: contractDecesion ? true : false,
    isTRApproved: true,
  };

  const getProposals = async () => {
    try {
      const response = await apiCall(
        requests.getProposals,
        { id: Number(proposalId) },
        'get',
        false,
        dispatch,
        user,
        router
      );
      setProposal(response?.data?.data?.proposals[0] || {});
    } catch (error) {
      console.warn('Error fetching tasks:', error);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (contracts?.isTEApproved) {
      toast.error('Contract cannot be edited as it has already been approved.');
      return;
    }
    const strippedTerms = editorTxt.replace(/<[^>]*>/g, '').trim();
    if (!strippedTerms) {
      toast.error('Contract terms cannot be empty. Please add terms before submitting.');
      return;
    }
    await apiCall(
      editMode ? requests.editContract + contracts.id : requests.makeContract,
      contractData,
      `${editMode ? 'put' : 'post'}`,
      true,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        if (!editMode) {
          setMsgNotify(true);
        }
        let message: any;
        if (res?.error) {
          message = res?.error?.message;
          if (Array.isArray(message)) {
            message?.map((msg: string) =>
              toast.error(msg ? msg : 'Something went wrong, please try again')
            );
          } else {
            toast.error(message ? message : 'Something went wrong, please try again');
          }
        } else {
          toast.success(res?.data?.message);
          setEditorTxt('');
          setOpenModal(false);
          handleClose();
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const getContract = async () => {
    setContractLoading(true);
    try {
      const res = await apiCall(
        requests.getContract,
        { proposalId: Number(proposalId) },
        'get',
        false,
        dispatch,
        user,
        router
      );
      setButtonsShow(res.data.data.contracts[0]?.isTEApproved ? false : true);
      setContracts(res?.data?.data?.contracts[0] || {});
      if (res?.data?.data?.contracts[0]?.id) {
        if (
          res?.data?.data?.contracts[0]?.status !== 'COMPLETED' &&
          res?.data?.data?.contracts[0]?.status !== 'INPROGRESS'
        ) {
          setEditMode(true);
        }
        setEditorTxt(res?.data?.data?.contracts[0]?.terms || '');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setContractLoading(false);
    }
  };

  const updateContract = async (id: number, decision: boolean) => {
    const formData = {
      ...contractData,
      isTEApproved: decision,
    };
    setButtonsShow(false);
    await apiCall(
      requests.editContract + id,
      formData,
      'put',
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setContracts(res?.data?.data || {});
        if (decision) {
          toast.success('Contract Accepted');
        }
        router.push(`/dashboard/tasks/${taskId}`);
      })
      .catch((err) => console.warn(err));
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    if (task?.details) {
      const response = await apiCall(
        requests.createContractDescription,
        { job_description: `${task?.details}` },
        'post',
        false,
        dispatch,
        null,
        null
      );
      if (response?.data?.contract_html) {
        setEditorTxt(response?.data?.contract_html);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      getContract();
      getProposals();
    }
  }, [proposalId]);

  useEffect(() => {
    setOpenModal(isOpen);
  }, [isOpen]);

  const handleEditorTxt = (value: any) => {
    setEditorTxt(value);
  };

  const handleClose = () => {
    setEditorTxt('');
    setOpenModal(false);
    onClose();
  };

  return (
    <>
      {openModal && (
        <>
          <style jsx>{`
            .modal.show .modal-dialog {
              width: 500px !important;
              max-width: 500px !important;
              min-height: 400px !important; /* Ensure minimum height */
              opacity: 1 !important;
              transition: none !important;
            }
            .modal-content-center {
              width: 100% !important;
              max-width: none !important;
              min-height: 400px !important; /* Ensure minimum height */
            }
            .modal.show {
              opacity: 1 !important;
              transition: none !important;
            }
          `}</style>
          <div className="ad-dispute">
            {user?.profile[0]?.type === 'TE' && !contracts?.id ? null : (
              <ModalWrapper
                modalId={'ContractModel88'}
                title={
                  contracts?.id && user?.profile[0]?.type === 'TR' && !contracts?.isTEApproved
                    ? 'Edit Contract'
                    : 'Contract'
                }
                handleClose={handleClose}
              >
                {contractLoading ? (
                  <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GlobalLoader />
                  </div>
                ) : user?.profile?.length > 0 && user?.profile[0]?.type === 'TE' ? (
                  <div className="card-body viewtask">
                    <div style={scrollableContainerStyle}>
                      <HtmlData data={contracts?.terms} className="text-white mb-4" />
                    </div>
                    {buttonsShow && (
                      <div className="text-end mb-3 mt-2">
                        <button
                          className="btn rounded-pill btn-outline-info mx-1 my-1"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={() => {
                            updateContract(contracts.id, true);
                            setOpenModal(false);
                            handleClose();
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="btn rounded-pill btn-outline-info mx-1 my-1"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={() => {
                            updateContract(contracts.id, false);
                            setOpenModal(false);
                            handleClose();
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card-body viewtask">
                    <label className="form-label text-light fs-12">Description:</label>
                    {contracts?.isTEApproved ? (
                      <div style={scrollableContainerStyle}>
                        <HtmlData data={contracts.terms} className="text-white mb-4" />
                      </div>
                    ) : (
                      <QuillEditor
                        className="text-white invert border-0"
                        style={{ height: '250px', width: '100%' }}
                        placeholder="Write your contract terms here..."
                        value={editorTxt}
                        setValue={handleEditorTxt}
                      />
                    )}
                    <div className="d-flex justify-content-end align-items-center mt-1 mb-3"></div>
                    {taskStatus !== 'COMPLETED' && taskStatus !== 'INPROGRESS' && !contracts?.isTEApproved && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <p className="btn text-info btn-sm rounded-pill p-0 ms-auto" onClick={handleGenerateAI}>
                          Generate through AI
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {user?.profile[0]?.type === 'TR' && (
                  <div className="modal-footer">
                    <div className="d-grid gap-2"></div>
                    {taskStatus !== 'COMPLETED' && taskStatus !== 'INPROGRESS' && !contracts?.isTEApproved && (
                      <button
                        type="submit"
                        className="btn btn-info btn-sm rounded-pill"
                        aria-label="Close"
                        onClick={handleSubmit}
                      >
                        Create
                      </button>
                    )}
                  </div>
                )}
                {loading && <GlobalLoader />}
              </ModalWrapper>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Contract;