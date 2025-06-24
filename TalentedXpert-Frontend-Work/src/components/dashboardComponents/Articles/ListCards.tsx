import HtmlData from '@/components/common/HtmlData/HtmlData';
import NoFound from '@/components/common/NoFound/NoFound';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { RootState, useAppDispatch } from '@/store/Store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { useNavigation } from '@/hooks/useNavigation';

const ListCards: FC<any> = ({ type, checkbox, setArticleId, articleId, setValue }) => {
    const user = useSelector((state: RootState) => state.user);
    const [article, setArticle] = useState<any>([])
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { navigate } = useNavigation()

    const getArticles = async () => {
        try {
            const response = await apiCall(requests?.articles, { profileId: user?.profile[0]?.id }, 'get', false, dispatch, user, router);
            setArticle(response?.data?.data?.articles || []);
        } catch (error) {
            console.warn("Error fetching articles:", error);
        }

    }

    useEffect(() => {
        getArticles();
    }, [])

    return (
        <>
            {article.length > 0 ? article.map((article: any) => (
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
                            {/* <div className='d-flex flex-wrap mb-2 mb-md-0 '>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>Networking</button>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>Development</button>
                                <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2 ${type === 'small' && 'mb-2'}`}>AI blockchain</button>
                            </div> */}
                            <div className='d-flex'>
                                {/* <div className={`d-flex mb-2 ${type === 'big' && 'mb-md-0'}`}>
                                    <Icon icon="ri:facebook-fill" className='me-2 text-light' />
                                    <Icon icon="lets-icons:insta" className="me-2 text-light" />
                                    <Icon icon="mdi:twitter" className="me-2 text-light" />
                                    <Icon icon="mdi:youtube" className='me-2 text-light' />
                                </div> */}
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
                </div>)) : <NoFound message={'Articles not found'} />}
            {article.length > 0 && type === 'small' &&
                <div className='text-end mt-2' >
                    <Link className="btn btn-outline-info bg-dark rounded-pill text-white fs-12 btn-sm" href={'/dashboard/articles'} onClick={()=> navigate(`/dashboard/articles`)}>
                        View All
                    </Link>
                </div>
            }
        </>
    )
}

export default ListCards