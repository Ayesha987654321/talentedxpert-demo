'use client'
import React, { FC, useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { articleSchema } from '@/schemas/article-schema/articleSdchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { dataForServer } from '@/models/articleModel/articleModel';
import FileUpload from '@/components/common/upload/FileUpload';
import { uploadFileToS3 } from '@/services/uploadFileToS3/uploadFileToS3';
import DocumentUploadTable from '@/components/common/DocumentUploadTable/DocumentUploadTable';
import GlobalLoader from '@/components/common/GlobalLoader/GlobalLoader';
const QuillEditor = dynamic(() => import('@/components/common/TextEditor/TextEditor'), { ssr: false });


const Newarticle: FC<any> = ({ type }: any) => {
    const { id } = useParams()
    const [documents, setDocuments] = useState<any>([])
    const [image, setImage] = useState<any>([])
    const [article, setArticle] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [description, setDescription] = useState<any>([])
    const user = useSelector((state: RootState) => state.user)
    const dispatch = useAppDispatch();
    const router = useRouter()
    type FormSchemaType = z.infer<typeof articleSchema>

    const getArticle = async (id: number) => {
        try {
            const response = await apiCall(requests?.articles, { id: Number(id) }, 'get', false, dispatch, user, router);
            if (response?.data?.data?.articles[0]) {
                setArticle(response?.data?.data?.articles[0] || {});
                setValue('image', response?.data?.data?.articles[0]?.image)
                setValue('description', response?.data?.data?.articles[0]?.description)
                setValue('title', response?.data?.data?.articles[0]?.title)
                setValue('documents', response?.data?.data?.articles[0]?.documents)
                setDocuments(response?.data?.data?.articles[0]?.documents)
                setDescription(response?.data?.data?.articles[0]?.description)
                setImage(Object.keys(response?.data?.data?.articles[0]?.image)?.length > 0 ? [response?.data?.data?.articles[0]?.image] : [])
            }
        } catch (error) {
            console.warn("Error fetching tasks:", error);
        }
    }

    useEffect(() => {
        if (type && id) {
            getArticle(Number(id));
        }
    }, [id])

    const { register, handleSubmit, setValue, clearErrors, formState: { errors, }, watch, setError } = useForm<FormSchemaType>({
        defaultValues: {
            description: '',
            profileId: Number(user?.profile[0]?.id),
            title: ''
        },
        resolver: zodResolver(articleSchema),
        mode: 'all'
    })

    const handleEditorTxt = (value: any) => {
        setDescription(value.replace(/<[^>]*>/g, '').trim() !== '' ? value : '')
        setValue("description", value.replace(/<[^>]*>/g, '').trim() !== '' ? value : '')
        clearErrors("description")
    }

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        const formData = dataForServer(data)
        await apiCall(`${type ? requests.articles + `/${id}` : requests.articles}`, formData, `${type ? 'put' : 'post'}`, true, dispatch, user, router).then((res: any) => {
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
                type ? router.push(`/dashboard/articles/${id}`) : router.push(`/dashboard/articles`);

            }
        }).catch(err => {
            // setIsFormSubmitted(false)
            console.warn(err)
        })
    }



    const handleGenerateAI = async () => {
        if (watch('title') === '') {
            setError('title', { message: "Please Enter The Title" })
            return;
        }

        if (watch('title') !== '') {
            setLoading(true)

            const response = await apiCall(requests.createArticleDescription, { title: `${watch('title')}` }, 'post', false, dispatch, null, null);
            console.log('resT', response)
            if (response?.data?.article_html) {
                setDescription(response?.data?.article_html);
            }
            setLoading(false);
        }
    }

    const handleFileSelect = async (files: File[], fileObjs: any[], onProgress: (progress: number) => void): Promise<number[]> => {
        const uploadedFileIds = files ? await uploadFileToS3(files, fileObjs, onProgress, true) : 0
        const temp: any = [...documents, ...uploadedFileIds];
        setDocuments(temp)
        if (uploadedFileIds.length > 0) {
            setValue('documents', temp)
        }
        return uploadedFileIds;
    }
    const handleFileSelect2 = async (files: File[], fileObjs: any[], onProgress: (progress: number) => void): Promise<number[]> => {
        const uploadedFileIds = files ? await uploadFileToS3(files, fileObjs, onProgress, true) : 0
        const temp: any = [...uploadedFileIds];
        setImage(temp)
        if (uploadedFileIds.length > 0) {
            setValue('image', temp[0])
        }
        return uploadedFileIds;
    }

    const handleDeleteFile = (id: any) => {
        const updatedDocuments = documents.filter((doc: any) => doc.fileUrl !== id);
        setDocuments(updatedDocuments);
        setValue('documents', updatedDocuments)
    };
    const handleDeleteImage = (id: any) => {
        const updatedImage = image.filter((doc: any) => doc.fileUrl !== id);
        setImage(updatedImage);
        setValue('image', updatedImage)
    };
    console.log('err', errors)

    return (

        <section className='addtask'>
            <div className="card">
                <div className="card-header bg-dark text-light">
                    <h5 className='mb-0'>{type ? 'Edit Article' : 'Add New Article'}</h5>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="card-body bg-gray">
                        <div className='row'>
                            <div className='col-md-6'>
                                <div className="mb-3">
                                    <label htmlFor="exampleFormControlInput1" className="form-label text-light fs-12">Title</label>
                                    <input {...register('title')} type="text" className="form-control bg-dark border-0" id="exampleFormControlInput1" placeholder="Title" />
                                    {
                                        errors.title && (
                                            <div className="text-danger pt-2">{errors.title.message}</div>
                                        )
                                    }
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleFormControlInput2" className="form-label text-light fs-12">Image</label>
                                    {/* <input type="text" className="form-control bg-dark border-0" id="exampleFormControlInput99" placeholder="Title" /> */}
                                    <FileUpload onFileSelect={handleFileSelect2} label="Upload Image" accept='image/*,application/pdf' type="task" />
                                </div>
                                <DocumentUploadTable documents={image} handleDeleteFile={handleDeleteImage} type={"Image"} />
                                {/* <div className="mb-3">
                                <label className="form-label text-light fs-12">Category</label>
                                <select className="form-select bg-dark border-0 text-tertiary" aria-label="Default select example">
                                    <option selected>Select category</option>
                                    <option value="1">One</option>
                                    <option value="2">Two</option>
                                    <option value="3">Three</option>
                                </select>
                            </div> */}
                                <div className='mb-3'>
                                    <label className="form-label text-light fs-12">Article Details</label>
                                    <div className="card border-0">
                                        <QuillEditor className="form-control text-white  invert border-0" style={{ height: '250px' }} placeholder="Write your description here..." value={description} setValue={handleEditorTxt} />
                                        <p className="btn text-info btn-sm rounded-pill p-0 ms-auto" onClick={handleGenerateAI}>
                                            Generate through AI
                                        </p>
                                        {/* <div className="card-body bg-dark p-0">
                                        <textarea className="form-control bg-dark border-0" id="exampleFormControlTextarea1" rows={6}></textarea>
                                    </div> */}
                                    </div>
                                    {
                                        errors.description && (
                                            <div className="text-danger pt-2">{errors.description.message}</div>
                                        )
                                    }

                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div className="mb-3">
                                    <label htmlFor="exampleFormControlInput3" className="form-label text-light fs-12">Tags</label>
                                    <input type="text" className="form-control bg-dark border-0" id="exampleFormControlInput3" placeholder="Add Tags" />
                                </div>
                                {/* <div className="mb-3">
                                    <label className="form-label text-light fs-12">Related Items</label>
                                    <select className="form-select bg-dark border-0 text-tertiary" aria-label="Default select example">
                                        <option value=''>Select related items</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div> */}
                                <div className="mb-3">
                                    <label htmlFor="exampleFormControlInput5" className="form-label text-light fs-12">Attach Documents</label>
                                    <FileUpload onFileSelect={handleFileSelect} label="Upload Documents" accept='image/*,application/pdf' type="task" />

                                    {/* <input type="text" className="form-control bg-dark border-0" id="exampleFormControlInput1" placeholder="Name" /> */}
                                    {/* <button type="button" className="btn btn-info btn-sm position-absolute article-btn">Browse</button> */}
                                </div>
                                <DocumentUploadTable documents={documents} handleDeleteFile={handleDeleteFile} type={'Document'} />
                                {/* <div className='mb-3'>
                                    
                                </div> */}
                            </div>
                            <div className='col-12 text-end'>
                                <button type="submit" className="btn btn-info btn-sm rounded-pill">Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
                {loading && <GlobalLoader />}
            </div>
        </section>
    )
}

export default Newarticle