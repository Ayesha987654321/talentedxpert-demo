"use client"
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { Icon } from '@iconify/react'
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppDispatch } from '@/store/Store';
import { useParams, useRouter } from 'next/navigation';
import TaskCard from '../dashboardComponents/tasks/TaskCard';
import NoFound from '../common/NoFound/NoFound';

const CompleteProjects = () => {
  const [details, setDetails] = useState<any>({})
  const [article, setArticle] = useState<any>([])
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState('');
  const { navigate } = useNavigation()
  const router = useRouter()
  const { userType, id } = useParams()
  const dispatch = useAppDispatch()

  const getUser = async (id: number) => {
    await apiCall(requests.getUserInfo + id, {}, 'get', false, dispatch, {}, router).then((res: any) => {
      setDetails({
        ...res?.data,
        profile: res?.data?.profile?.filter((prof: any) => userType === 'talent-requestors' ? prof?.type === 'TR' : prof?.type === 'TE')
      })
    }).catch(err => console.warn(err))
  }
  useEffect(() => {
    if (id) {
      getUser(Number(id));
    }
  }, [id])
  console.log('details', details)
  return (

    <div className='card'>
      <div className='card first-card card-header'>
        <h3>Completed Projects</h3>
      </div>

      <div className='card-bodyy my-active-task py-2 '>

 <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabIndex={0}>
                            {/* {loading && <SkeletonLoader count={20} />} */}
                            { details && details?.completedTasks?.length > 0 ?
                                details.completedTasks?.map((task: any) => <TaskCard key={task?.task?.id} task={task?.task} reviews={task?.requesterProfile?.averageRating} status={status} />)
                                : <NoFound message={"No Task Found"} /> 
                            }
                        </div>







      </div>

  {/* {article.length > 0 ? article.map((article: any) => (
                <div className="card bg-dark mb-2" key={article?.id}>
                    <div className="card-body">
                        {type === 'small' ?
                            <label className="form-check-label text-light fs-14 border-bottom my-2">
                                {checkbox && <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={articleId?.includes(article.id)}
                                    onChange={() => {

                                        setArticleId((prev: any[]) =>
                                            prev.includes(article.id)
                                                ? prev.filter((id) => id !== article.id)
                                                : [...prev, article.id]
                                        )
                                        
                                    }
                                    }
                                />}
                                {article?.title}
                            </label>
                            : <h6 className='text-light pb-3 border-bottom'>{article?.title}</h6>
                        }
                        <HtmlData data={article?.description} className='text-light fs-12 truncate-overflow line-clamp-2 ' />
                        
                        <div className={type === 'small' ? `d-flex align-items-center justify-content-around flex-wrap` : `d-md-flex align-items-center justify-content-between mt-3`}>
                            <div className='d-flex flex-wrap mb-2 mb-md-0 '>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>Networking</button>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>Development</button>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>AI blockchain</button>
                            </div>
                            <div className='d-flex'>
                                <div className={`d-flex mb-2 ${type === 'big' && 'mb-md-0'}`}>
                                    <Icon icon="ri:facebook-fill" className='me-2 text-light' />
                                    <Icon icon="lets-icons:insta" className="me-2 text-light" />
                                    <Icon icon="mdi:twitter" className="me-2 text-light" />
                                    <Icon icon="mdi:youtube" className='me-2 text-light' />
                                </div>
                                {type === 'big' &&
                                    <div className='d-flex mb-2 mb-md-0'>
                                        <Link className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm ls" href={`/dashboard/articles/${article?.id}`} onClick={()=> navigate(`/dashboard/articles/${article?.id}`)}>
                                            View Details  <Icon icon="line-md:arrow-right" className='ms-1' />
                                        </Link>
                                    </div>
                                }
                            </div>
                        </div>
                        {type === 'small' &&
                            <div className='text-end '>
                                <Link className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm" href={`/dashboard/articles/${article?.id}`} onClick={()=> navigate(`/dashboard/articles/${article?.id}`)}>
                                    View Details  <Icon icon="line-md:arrow-right" className='ms-1' />
                                </Link>
                            </div>
                        }
                    </div>
                </div>)) : <NoFound message={'Articles not found'} />} */}
    </div>
  )
}

export default CompleteProjects