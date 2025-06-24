'use client'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import HtmlData from '@/components/common/HtmlData/HtmlData';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { toast } from 'react-toastify';
import DeleteConfirmation from '@/components/common/Modals/DeleteConfirmation';


export const Viewarticle = () => {
    const { id } = useParams()
    const user = useSelector((state: RootState) => state.user);
    const { navigate } = useNavigation()
    const [article, setArticle] = useState<any>([{}])
    const dispatch = useAppDispatch();
    const router = useRouter();

    const getArticle = async (Id: number) => {
        try {
            const response = await apiCall(requests?.articles, { id: Number(Id) }, 'get', false, dispatch, user, router);
            setArticle(response?.data?.data?.articles[0] || {});
        } catch (error) {
            console.warn("Error fetching tasks:", error);
        }
    }

    const onDelete = async (id: number) => {

        apiCall(requests.articles +'/'+ id, '', 'delete', false, dispatch, user, router).then((res: any) => {
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

                router.push('/dashboard/articles')

            }
        }).catch(err => {
            console.warn(err)
        })
    }


        useEffect(() => {
            if (id) {
                getArticle(Number(id));
            }
        }, [id])

        return (
            <section className='addtask'>
                <div className="card">
                    <div className="card-header bg-dark text-light">
                        <h3 className='mb-0'>View Article</h3>
                    </div>
                    <div className="card-body bg-gray">
                        <div className="card bg-dark mb-2">
                            <div className="card-body">
                                <h6 className='text-light fw-light'>{article?.title}</h6>
                                <HtmlData data={article?.description} className='text-white' />
                                {article?.documents?.map((doc: any) => (
                                    <div key={doc.fileUrl}>
                                        <Link href={doc.fileUrl} target="_blank">
                                            {doc.key}
                                        </Link>
                                    </div>
                                ))}
                               
                                   {article?.image?.fileUrl && <div key={article?.image?.fileUrl}>
                                        <Link href={article?.image?.fileUrl} target="_blank">
                                            {article?.image?.key}
                                        </Link>
                                    </div>}
                                
                                <div className='d-md-flex align-items-center justify-content-between mt-3'>
                                    {/* <div className='d-flex flex-wrap mb-2 mb-md-0  '>
                                        <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2">Networking</button>
                                        <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2">Development</button>
                                        <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2">AI blockchain</button>
                                    </div> */}
                                    {/* <div className='d-flex'>
                                        <div className='d-flex mb-2 mb-md-0'>
                                            <Icon icon="ri:facebook-fill" className='me-2 text-light' />
                                            <Icon icon="lets-icons:insta" className="me-2 text-light" />
                                            <Icon icon="mdi:twitter" className="me-2 text-light" />
                                            <Icon icon="mdi:youtube" className='me-2 text-light' />
                                        </div>
                                    </div> */}
                                </div>
                                <div className='d-md-flex align-items-center justify-content-end mt-3'>
                                    {user?.profile[0].type === 'TE' &&
                                        <div>
                                            <Link className="btn rounded-pill btn-outline-info mx-1  my-1" href={`/dashboard/articles/${article.id}/edit`} onClick={()=> navigate(`/dashboard/articles/${article.id}/edit`)}>Edit Article</Link>
                                            <button className='btn rounded-pill btn-outline-danger' data-bs-target="#exampleModalToggle24" data-bs-toggle="modal" >Delete</button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DeleteConfirmation onClickFunction={onDelete} type={'article'} id={id} />
            </section>
            
        )
    }
