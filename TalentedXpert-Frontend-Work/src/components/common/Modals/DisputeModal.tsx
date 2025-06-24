'use client'
import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useEffect, useState } from 'react'
import FileUpload from '../upload/FileUpload'
import { uploadFileToS3 } from '@/services/uploadFileToS3/uploadFileToS3'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { disputeSchema } from '@/schemas/dispute-schema/disputeSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { dataForServer } from '@/models/disputeModel/disputeModel'
import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@/store/Store'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useNavigation } from '@/hooks/useNavigation'

const DisputeModal = ({ taskId, type, proposalId, getdisputes }: any) => {
    const [documents, setDocuments] = useState<any>([])
    const [tasks, setTasks] = useState<any>([])
    const [disputeDetail, setDisputeDetail] = useState<any>([])
    const user = useSelector((state: RootState) => state.user)
    const dispatch = useAppDispatch();
    const router = useRouter()
    const { navigate } = useNavigation()
    type FormSchemaType = z.infer<typeof disputeSchema>

    useEffect(() => {
        if (type) {
            getTasks()
        } else if (!type && taskId) {
            getDispute(taskId)
        }
        //react-hooks/exhaustive-deps
    }, [type, taskId]);

    const getTasks = async () => {
        let filters = "?status=INPROGRESS"
        filters += '&profileType=' + user?.profile[0]?.type
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
            console.warn("Error fetching tasks:", error);
        } finally {

        }
    };


    const { register, handleSubmit, setValue, formState: { errors, }, watch, reset } = useForm<FormSchemaType>({
        defaultValues: {
            description: '',
            status: 'INITIALIZED',
            taskId: String(taskId) || '',
        },
        resolver: zodResolver(disputeSchema),
        mode: 'all'
    })

    // useEffect(()=>{
    // setValue('taskId',taskId)
    // },[taskId])

    console.log('err dis', errors)

    const getDispute = async (taksId: number) => {
        const data = {
            'taskId': taksId
        }

        await apiCall(requests.dispute, data, 'get', false, dispatch, user, router).then((res: any) => {
            setDisputeDetail(res?.data?.data?.disputes || [])
            if (res?.data?.data?.disputes) {
                setValue('description', res?.data?.data?.disputes[0]?.description)
                setValue('documents', res?.data?.data?.disputes[0]?.documents)
                setDocuments(res?.data?.data?.disputes[0].documents || [])
            }
        }).catch(err => console.warn(err))
    }

    const handleDeleteFile = (id: any) => {
        const updatedDocuments = documents.filter((doc: any) => doc.fileUrl !== id);
        setDocuments(updatedDocuments);
        setValue('documents', updatedDocuments)

    };

    const handleFileSelect = async (files: File[], fileObjs: any[], onProgress: (progress: number) => void): Promise<number[]> => {
        const uploadedFileIds = files ? await uploadFileToS3(files, fileObjs, onProgress, true) : 0
        const temp: any = [...documents, ...uploadedFileIds];
        setDocuments(temp)

        if (uploadedFileIds.length > 0) {
            setValue('documents', temp)
        }

        return uploadedFileIds;

    }

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        let newData = null
        const formData = dataForServer(data)
        if (disputeDetail[0]?.id) {
            const { taskId, ...other } = formData;
            newData = other
        }

        await apiCall(`${disputeDetail[0]?.id ? requests.editDispute + disputeDetail[0]?.id : requests.dispute}`, disputeDetail[0]?.id ? newData : formData, `${disputeDetail[0]?.id ? 'patch' : 'post'}`, true, dispatch, user, router).then((res: any) => {
            let message: any;
            if (res?.error) {
                message = res?.error?.message;

                if (Array.isArray(message)) {
                    message?.map((msg: string) => toast.error(msg ? msg : 'Something went wrong, please try again'));
                } else {
                    toast.error(message ? message : 'Something went wrong, please try again')
                }
                // setIsFormSubmitted(false)
            } else {
                // setIsFormSubmitted(false)
                toast.success(res?.data?.message)
                reset()
                const closeButton = document.querySelector('#exampleModalToggle11 .btn-close') as HTMLButtonElement | null
                if (closeButton) {
                    closeButton.click()
                }
                router.push('/dashboard/disputes');
                getdisputes()

            }
        }).catch(err => {
            // setIsFormSubmitted(false)F
            console.warn(err)
        })

    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='ad-dispute'>
                <div className="modal fade" id="exampleModalToggle11" aria-hidden="true" aria-labelledby="exampleModalToggleLabel11" tabIndex={1}>
                    <div className="modal-dialog  modal-dialog-centered   ">

                        <div className="modal-content modal-content-center">

                            <div className="modal-header">
                                <h5 className="modal-title text-white" id="exampleModalToggleLabel11">{type ? 'Add Dispute' : (disputeDetail[0]?.id ? "Edit Dispute" : "Add Dispute")}</h5>
                                <button type="button" className="btn-close bg-light" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">

                                {type && <div className="mb-3">
                                    <label htmlFor="taskDropdown" className="form-label">Task :</label>
                                    <select {...register('taskId')} className="form-select" id="taskDropdown" defaultValue="">
                                        <option value="" disabled>Select task</option>
                                        {tasks.map((data: any) => <option value={data?.id} key={data?.id}>{data?.name}</option>)}
                                        
                                        {/* <option value="task1">Task 1</option>
                                        <option value="task2">Task 2</option>
                                        <option value="task3">Task 3</option> */}
                                    </select>
                                    {
                                        errors?.taskId && (
                                            <div className="text-danger pt-2">{errors?.taskId?.message}</div>
                                        )
                                    }
                                </div>}
                                <div className="mb-3 ">
                                    <label htmlFor="exampleFormControlTextarea1" className="form-label">Description</label>
                                    <textarea {...register('description')} className="form-control" id="exampleFormControlTextarea1" rows={3}></textarea>
                                    {
                                        errors.description && (
                                            <div className="text-danger pt-2">{errors.description.message}</div>
                                        )
                                    }
                                </div>

                                <FileUpload onFileSelect={handleFileSelect} label="Upload File" accept='image/*,application/pdf' type="task" />
                                <div>
                                    {documents?.map((data: any, index: number) => (
                                        <div key={index} className='d-flex justify-content-between'>
                                            <p className="form-label text-light fs-12">{data.key}</p>
                                            <Icon icon="line-md:close" onClick={() => handleDeleteFile(data.fileUrl)} style={{ marginLeft: '8px', cursor: 'pointer' }} />
                                        </div>
                                    ))}

                                </div>

                            </div>
                            <div className="modal-footer">
                                <div className="d-grid gap-2">

                                </div>
                                <button type="submit" className="btn btn-primary"  >Submit</button>
                            </div>
                        </div>

                    </div>
                </div>





            </div>
        </form>
    )
}

export default DisputeModal
