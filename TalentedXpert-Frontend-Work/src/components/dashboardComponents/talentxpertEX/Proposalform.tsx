'use client'
import React, { FC, useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addproposalSchema } from '@/schemas/addproposal-schema/addproposalSchema';
import { z } from 'zod';
import { RootState, useAppDispatch } from '@/store/Store';
import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { dataForServer } from '@/models/proposalModel/proposalModel';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { toast } from 'react-toastify';
import FileUpload from '@/components/common/upload/FileUpload';
import { uploadFileToS3 } from '@/services/uploadFileToS3/uploadFileToS3';
import DocumentUploadTable from '@/components/common/DocumentUploadTable/DocumentUploadTable';
import ListCards from '../Articles/ListCards';
import HtmlData from '@/components/common/HtmlData/HtmlData';
import GlobalLoader from '@/components/common/GlobalLoader/GlobalLoader';
import dynamic from 'next/dynamic';
import { useNavigation } from '@/hooks/useNavigation';
const QuillEditor = dynamic(() => import('@/components/common/TextEditor/TextEditor'), { ssr: false });

type FormSchemaType = z.infer<typeof addproposalSchema>

export const Proposalform: FC<any> = ({ type }) => {
    const user = useSelector((state: RootState) => state.user)
    const [editorTxt, setEditorTxt] = useState('');
    const [taskdetail, setTaskDetail] = useState<any>()
    const [documents, setDocuments] = useState<any>([])
    const [articleId, setArticleId] = useState<any>([])
    const [addTeam, setAddTeam] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [teams, setTeams] = useState<any>([]);
    const [showJobDetails, setShowJobDetails] = useState<boolean>(false);

    const { id, proposalId } = useParams()
    const dispatch = useAppDispatch();
    const router = useRouter()
    const { navigate } = useNavigation()

    const getAllTeams = async () => {
        try {
            setLoading(true);
            const response = await apiCall(
                requests.teams,
                { type: 'created' },
                'get',
                false,
                dispatch,
                user,
                router
            );
            setTeams(response?.data?.data)
        } catch (error) {
            console.warn("Error fetching teams:", error);
        } finally {
            setLoading(false);
        }
    }

    const getProposal = async () => {
        try {
            const response = await apiCall(requests?.getProposals, { id: Number(proposalId) }, 'get', false, dispatch, user, router);
            if (response?.data?.data?.proposals[0]) {
                setValue('details', response?.data?.data?.proposals[0].details || '');
                setValue('amount', (response?.data?.data?.proposals[0].amount.toString()) || '');
                setValue('answers', response?.data?.data?.proposals[0].answers)
                setValue('documents', response?.data?.data?.proposals[0].documents || [])
                setDocuments(response?.data?.data?.proposals[0].documents || [])
                if (response?.data?.data?.proposals[0]?.articles[0]) {
                    const articleIds = response?.data?.data?.proposals[0]?.articles.map(
                        (article: any) => article?.articleId
                    );
                    setArticleId((prev: any) => [...prev, ...articleIds]);
                }
                if (response?.data?.data?.proposals[0]?.teamId)
                    setAddTeam(true)
                setValue('teamId', response?.data?.data?.proposals[0]?.teamId || '')
                setEditorTxt(response?.data?.data?.proposals[0].details)
            }
        } catch (error) {
            console.warn("Error fetching proposal:", error);
        }
    }

    const { register, formState: { errors }, reset, handleSubmit, setValue, getValues, watch } = useForm<FormSchemaType>({
        defaultValues: {
            details: '',
            amount: '',
            expertProfileId: user?.profile[0]?.id?.toString() || '',
            teamId: '',
            taskId: id?.toString(),
            status: 'SUBMITTED',
            answers: []
        },
        resolver: zodResolver(addproposalSchema),
        mode: 'all'
    })

    useEffect(() => {
        if (articleId) {
            setValue('articles', articleId)
        }
    }, [articleId])

    useEffect(() => {
        if (editorTxt) {
            setValue('details', editorTxt)
        }
    }, [editorTxt])

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        const formData = dataForServer(data)
        await apiCall(`${type ? requests.updateProposal + proposalId : requests.addProposal}`, formData, `${type ? 'put' : 'post'}`, true, dispatch, user, router).then((res: any) => {
            let message: any;
            if (res?.error) {
                message = res?.error?.message;
                if (Array.isArray(message)) {
                    message?.map((msg: string) => toast.error(msg ? msg : 'Something went wrong, please try again'));
                } else {
                    toast.error(message ? message : 'Something went wrong, please try again')
                }
            } else {
                toast.success(res?.data?.message)
                reset({})
                type ? navigate(`/dashboard/tasks/${id}/proposals/${proposalId}`) : navigate(`/dashboard/tasks/${id}`);
            }
        }).catch(err => {
            console.warn(err)
        })
    }

    const getTask = async (id: number) => {
        await apiCall(requests.getTaskId + id, {}, 'get', false, dispatch, user, router).then((res: any) => {
            setTaskDetail(res?.data?.data?.task || [])
        }).catch(err => console.warn(err))
    }

    useEffect(() => {
        getTask(Number(id));
        getAllTeams()
        if (type) {
            getProposal()
        }
    }, [])

    const handleFileSelect = async (files: File[], fileObjs: any[], onProgress: (progress: number) => void): Promise<number[]> => {
        const uploadedFileIds = files ? await uploadFileToS3(files, fileObjs, onProgress, true) : 0
        const temp: any = [...documents, ...uploadedFileIds];
        setDocuments(temp)
        if (uploadedFileIds.length > 0) {
            setValue('documents', temp)
        }
        return uploadedFileIds;
    }

    const handleDeleteFile = (id: any) => {
        const updatedDocuments = documents.filter((doc: any) => doc.fileUrl !== id);
        setDocuments(updatedDocuments);
        setValue('documents', updatedDocuments)
    };

    const handleGenerateAI = async () => {
        setLoading(true)
        if (taskdetail) {
            const response = await apiCall(requests.createProposalDescription, { prompt: `${taskdetail?.details}` }, 'post', false, dispatch, null, null)
            if (response?.data) {
                setEditorTxt(response?.data)
                setValue('details', response?.data || '')
            }
            setLoading(false)
        }
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddTeam(e.target.checked);
    }

    const handleEditorTxt = (value: any) => {
        setEditorTxt(value.replace(/<[^>]*>/g, '').trim() !== '' ? value : '')
    }

    const toggleJobDetails = () => {
        setShowJobDetails(!showJobDetails)
    }

    useEffect(() => {
        taskdetail?.interviewQuestions?.forEach((data: any, index: number) => {
            setValue(`answers.${index}.questionId`, data?.id || 0);
        });
    }, [taskdetail, setValue]);

    return (
        <section className='addtask'>

            <div className="card">
                <div className="card-header bg-dark text-light d-flex justify-content-between align-items-center">
                    <h5 className='mb-0'>{type ? 'Edit Proposal' : 'Submit Proposal'}</h5>
                    <button
                        className='btn btn-outline-info rounded-pill'
                        onClick={toggleJobDetails}
                    >
                        {showJobDetails ? 'Hide Job Details' : 'Job Details'}
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="card-body bg-gray">
                        <div className="row">
                            <div className={`col-md-${showJobDetails ? '6' : '12'} transition-all duration-300`}>
                                <div className="card bg-light">
                                    <div className="card-body">

                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlTextarea1" className="form-label text-dark fs-14">Proposal Description: <span style={{ color: 'red' }}>*</span></label>
                                            <QuillEditor
                                                className="bg-white text-white invert border-0"
                                                style={{ height: '250px' }}
                                                placeholder="proposal details"
                                                value={editorTxt}
                                                setValue={handleEditorTxt}
                                            />
                                            <div className="d-flex align-items-center mt-1 mb-3">
                                                {errors.details && (
                                                    <div className="text-danger">{errors.details.message}</div>
                                                )}
                                                <p className="btn text-info btn-sm rounded-pill p-0 ms-auto" onClick={handleGenerateAI}>
                                                    Generate through AI
                                                </p>
                                            </div>
                                        </div>

                                        {showJobDetails ? (
                                            <>
                                                <div className="mb-3">
                                                    <label htmlFor="exampleFormControlInput1" className="form-label text-dark fs-14">Amount <span style={{ color: 'red' }}>*</span></label>
                                                    <input
                                                        {...register('amount')}
                                                        type="text"
                                                        className="form-control bg-dark-gray border-0"
                                                        id="exampleFormControlInput1"
                                                        placeholder="$20K"
                                                    />
                                                    {errors?.amount && (
                                                        <div className="text-danger pt-2">{errors?.amount?.message}</div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="fileUpload" className="form-label text-dark fs-14">Document</label>
                                                    <FileUpload
                                                        onFileSelect={handleFileSelect}
                                                        label="Upload File"
                                                        accept='image/*,application/pdf'
                                                        type="task"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className='row'>
                                                <div className='col-6'>
                                                    <div className="mb-3">
                                                        <label htmlFor="exampleFormControlInput1" className="form-label text-dark fs-14">Amount <span style={{ color: 'red' }}>*</span></label>
                                                        <input
                                                            {...register('amount')}
                                                            type="text"
                                                            className="form-control bg-dark-gray border-0"
                                                            id="exampleFormControlInput1"
                                                            placeholder="Amount "
                                                        />
                                                        {errors?.amount && (
                                                            <div className="text-danger pt-2">{errors?.amount?.message}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='col-6'>
                                                    <div className='mb-3'>
                                                        <label htmlFor="fileUpload" className="form-label text-dark fs-14">Document </label>
                                                        <FileUpload
                                                            onFileSelect={handleFileSelect}
                                                            label="Upload File"
                                                            accept='image/*,application/pdf'
                                                            type="task"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <DocumentUploadTable
                                            documents={documents}
                                            handleDeleteFile={handleDeleteFile}
                                            type={'Document'}
                                        />
                                        <div className="mb-3">
                                            <input
                                                type="checkbox"
                                                id={'submit Team'}
                                                checked={addTeam}
                                                onChange={handleCheckboxChange}
                                                className="form-check-input bg-dark border-light"
                                            />
                                            <label htmlFor={'submit Team'} className="form-check-label ms-2">
                                                <HtmlData data={'Submit as a Team'} className="text-dark" />
                                            </label>
                                        </div>
                                        {addTeam && (
                                            <div className="mb-3">
                                                <label htmlFor="taskDropdown" className="form-label">Teams :</label>
                                                <select
                                                    {...register('teamId')}
                                                    className="form-select bg-dark-gray"
                                                    id="taskDropdown"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select team</option>
                                                    {teams?.teams?.map((data: any) => (
                                                        <option value={data?.id} key={data?.id}>{data?.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {taskdetail?.interviewQuestions[0]?.id && (
                                            <h5 className='text-dark mb-3'>Interview Questions</h5>
                                        )}
                                        {taskdetail?.interviewQuestions?.map((data: any, index: number) => (
                                            <div className="mb-3" key={index}>
                                                <label htmlFor="exampleFormControlTextarea1" className="form-label fs-15 text-dark mb-1">{data.question}</label>

                                                {data.type === 'TEXT' && (
                                                    <input
                                                        {...register(`answers.${index}.answer`)}
                                                        type="text"
                                                        className="form-control bg-dark-gray border-0"
                                                        placeholder="Your answer"
                                                    />
                                                )}
                                                {data.type === 'TEXTAREA' && (
                                                    <textarea
                                                        {...register(`answers.${index}.answer`)}
                                                        className="form-control bg-dark-gray border-0"
                                                        placeholder="Write your answer here..."
                                                        rows={4}
                                                    />
                                                )}
                                                {data.type === 'RADIO' && (
                                                    <div>
                                                        {data.options?.map((option: string, optIndex: number) => (
                                                            <div key={optIndex} className="form-check form-check-inline">
                                                                <input
                                                                    {...register(`answers.${index}.answer`)}
                                                                    type="radio"
                                                                    value={option}
                                                                    id={`radio-${index}-${optIndex}`}
                                                                    className="form-check-input"
                                                                />
                                                                <label htmlFor={`radio-${index}-${optIndex}`} className="form-check-label">
                                                                    <HtmlData data={option} className="text-dark" />
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {data.type === 'DROPDOWN' && (
                                                    <select
                                                        {...register(`answers.${index}.answer`)}
                                                        className="form-control bg-dark-gray border-0"
                                                    >
                                                        <option value="">Select an option</option>
                                                        {data.options?.map((option: string, optIndex: number) => (
                                                            <option key={optIndex} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                {data.type === 'CHECKBOX' && (
                                                    <div>
                                                        {data.options?.map((option: string, optIndex: number) => (
                                                            <div key={optIndex} className="form-check form-check-inline">
                                                                <input
                                                                    type="checkbox"
                                                                    value={option}
                                                                    id={`checkbox-${index}-${optIndex}`}
                                                                    className="form-check-input"
                                                                />
                                                                <label htmlFor={`checkbox-${index}-${optIndex}`} className="form-check-label">
                                                                    <HtmlData data={option} className="text-white" />
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {errors?.answers?.[index]?.answer && (
                                                    <div className="text-danger pt-2">{errors?.answers?.[index]?.answer.message}</div>
                                                )}
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                            <div className={`col-md-6 transition-all duration-300 ${showJobDetails ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
                                {showJobDetails && (
                                    <div className="card bg-light h-100">
                                        <div className="card-body">
                                            <div className='d-flex justify-content-between'>
                                                <h3 className='me-2 text-dark'>{taskdetail?.name}</h3>
                                                <h5 className='w-9 text-dark'>$ {taskdetail?.amount}</h5>
                                            </div>
                                            <HtmlData data={taskdetail?.details} className='text-dark' isDark={true} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card bg-light mt-3">
                            <div className="card-body">
                                <div className='card-header bg-dark mb-2'>
                                    <h6 className='text-light ms-3 my-1'>My Articles</h6>
                                </div>
                                <ListCards
                                    type={'small'}
                                    checkbox={true}
                                    setArticleId={setArticleId}
                                    articleId={articleId}
                                />
                                <div className='text-end mt-3'>
                                    <button
                                        className="btn btn-info rounded-pill"
                                        type="submit"
                                    >
                                        Submit Proposal
                                    </button>
                                </div>

                            </div>
                        </div>
                        {loading && <GlobalLoader />}
                    </div>
                </form>

            </div>
        </section>
    )
}