'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { InviteTEschema } from '@/schemas/InviteTE-schema/InviteTEschema';
import { dataForServer } from '@/models/InviteTEmodel/InviteTEmodel';
import * as bootstrap from 'bootstrap';
import ModalWrapper from '../ModalWrapper/ModalWrapper';


interface InviteModalProps {
  userId: string | number;
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ userId, isOpen, onClose }) => {
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false)
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const modalRef = useRef<bootstrap.Modal | null>(null); // Ref to store modal instance

  type FormSchemaType = z.infer<typeof InviteTEschema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormSchemaType>({
    defaultValues: {
      description: '',
      expertProfileId: String(userId),
      taskId: '',
    },
    resolver: zodResolver(InviteTEschema),
    mode: 'all',
  });

  useEffect(() => {
    setOpenModal(true)
  }, [isOpen])


  useEffect(() => {
    getTasks();
  }, []);

  useEffect(() => {
    if (userId) {
      setValue('expertProfileId', String(userId));
    }
  }, [userId, setValue]);



  const getTasks = async () => {
    let filters = '?status=POSTED';
    filters += `&profileType=${user?.profile[0]?.type || ''}`;

    try {
      const response = await apiCall(
        `${requests.getTaskOnStatus}${user?.id}${filters}`,
        {},
        'get',
        false,
        dispatch,
        user,
        router
      );
      setTasks(response?.data?.data?.tasks || []);
    } catch (error) {
      console.warn('Error fetching tasks:', error);
    }
  };
  const handleClose = () => {
    setOpenModal(false)
    onClose()


  }


  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    setIsSubmitting(true);
    const formData = dataForServer(data);

    try {
      const res = await apiCall(requests.inviteTE, formData, 'post', true, dispatch, user, router);

      if (res?.error) {
        const message = res?.error?.message;
        if (Array.isArray(message)) {
          message.forEach((msg: string) => toast.error(msg || 'Something went wrong, please try again'));
        } else {
          toast.error(message || 'Something went wrong, please try again');
        }
      } else {
        toast.success(res?.data?.message);
        handleClose()
        reset();
      }
    } catch (err) {
      console.warn('Submission error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {openModal &&
        <div className='ad-review'>
          <ModalWrapper modalId={"InviteMemberModal99"} title={'Invite Xpert'} handleClose={handleClose}>
            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="mb-3">
                <label htmlFor="taskDropdown" className="form-label">
                  Select Task:
                </label>
                <select {...register('taskId')} className="form-select" id="taskDropdown" defaultValue="">
                  <option value="" disabled>
                    Select task
                  </option>
                  {tasks.map((task) => (
                    <option value={task.id} key={task.id}>
                      {task.name}
                    </option>
                  ))}
                </select>
                {errors.taskId && <div className="text-danger pt-2">{errors.taskId.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                  Description:
                </label>
                <textarea
                  {...register('description')}
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows={5}
                />
                {errors.description && <div className="text-danger pt-2">{errors.description.message}</div>}
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Inviting...' : 'Invite'}
                </button>
              </div>

            </form>
          </ModalWrapper>
        </div>
      }
    </>
  );
};

export default InviteModal;