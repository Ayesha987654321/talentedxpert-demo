'use client'
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { RootState, useAppDispatch } from '@/store/Store';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import Link from 'next/link';
import HtmlData from '@/components/common/HtmlData/HtmlData';

const ArticleDetail = () => {
    const { articleId } = useParams()
    const user = useSelector((state: RootState) => state.user);
    const [article, setArticle] = useState<any>([{}])
    const dispatch = useAppDispatch();
    const router = useRouter();

    const getArticle = async (Id: number) => {
        try {
            const response = await apiCall(requests?.articles, { id: Number(Id) }, 'get', false, dispatch, user, router);
            setArticle(response?.data?.data?.article[0] || {});
        } catch (error) {
            console.warn("Error fetching tasks:", error);
        }
    }

    useEffect(() => {
        if (articleId) {
            getArticle(Number(articleId));
        }
    }, [articleId])

    return (
        <div>
            <div className='card'>
                <div className='viewtask-card card-header px-4 bg-gray'>
                    <div className='card-left-heading'>
                        <h3>Article Detail</h3>
                    </div>
                    <div className="box m-2 bg-black keyfun p-3">
                        <h4 className='text-white'>{article?.task?.name}</h4>
                        <HtmlData data={article?.description} className='text-white' />
                        {article?.documents?.map((doc: any) => (
                            <div key={doc.fileUrl}>
                                <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                    {doc.key}
                                </Link>
                            </div>
                        ))}
                        <div className='btn-border mt-4'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ArticleDetail
