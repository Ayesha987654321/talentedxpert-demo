import { mytasks } from '@/services/helpers/mytasks'
import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import ImageFallback from '../common/ImageFallback/ImageFallback';
import Tasks from './tasks';
import { RootState, useAppDispatch } from '@/store/Store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';

const MyActiveTask = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [filters, setFilters] = useState<string>('')
    const [tasks, setTasks] = useState<any>([])
    const dispatch = useAppDispatch()
    const user = useSelector((state: RootState) => state.user)
    const router = useRouter()

    // useEffect(() => {
    //     let filters = "?status=INPROGRESS"
    //     filters += '&profileType=' + `${user?.profile?.length > 0 && user?.profile[0]?.type}`
    //     getAllTasks(filters)

    // }, [])

    const getAllTasks = async (params: any) => {
        try {
            setLoading(true);
            const response = await apiCall(
                `${requests.getTaskOnStatus}${user?.id}${params}`,
                {},
                'get',
                false,
                dispatch,
                user,
                router
            );
            setTasks(response?.data?.data || []);
        } catch (error) {
            console.warn("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='card'>
            {/* <div className='bg-dark text-white card-header d-flex justify-content-between px-4 '>
                <div className='card-left-heading'>
                    <h3>My Active Tasks ({tasks.count})</h3>
                </div>
            </div> */}
            <Tasks isactive={true} topMenu={false} />
        </div>
    )
}

export default MyActiveTask
