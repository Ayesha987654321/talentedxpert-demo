'use client'
import React, { FC, useEffect, useState } from 'react'
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import { useParams, useRouter } from 'next/navigation';
import { Pagination } from '../common/Pagination/Pagination';
import InviteModal from '../common/Modals/inviteModal';
import UsersCard from './UsersCard';
import FilterCard from './FilterCard';
import NoFound from '../common/NoFound/NoFound';

const Talentedxperts: FC<any> = ({ isDashboard }) => {
    const { userType } = useParams()
    const user = useSelector((state: RootState) => state.user)
    const [users, setUsers] = useState<any>([])
    const [userId, setUserId] = useState<any>()
    const [limit, setLimit] = useState<number>(12)
    const [page, setPage] = useState<number>(1)
    const [filters, setFilters] = useState<string>('')
    const [disability, setDisability] = useState<boolean>(false)
    const [promoted, setPromoted] = useState<boolean>(true)
    const [rating, setRating] = useState<number>(0)
    const [showModal, setShowModal] = useState<boolean>(false)
    const [search, setSearch] = useState<string>('')
    const dispatch = useAppDispatch();
    const router = useRouter()
    const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (filters && filters != "") {
            getUserDetails(filters);
        }
    }, [filters])

    useEffect(() => {
        setFilterParams();
    }, [limit, promoted, rating, disability, search])

    const getUserDetails = async (params: any) => {
        setLoading(true);
        await apiCall(`${requests.getUserAll}${params}`, {}, 'get', false, dispatch, user, router).then((res: any) => {
            if (res?.error) {
                console.warn(res?.error)
                setUsers([])
                setLoading(false)
            } else {
                setUsers(res?.data?.data)
                setLoading(false)
            }
        }).catch(err => {
            console.warn(err)
            setLoading(false)
        })
    }

    const setFilterParams = () => {
        let filters = "";

        filters += '?page=' + 1 || '';
        // user ? filters += '&profileType=' + `${user?.profile?.length > 0 && user?.profile[0]?.type}` : ''
        filters += limit > 0 ? '&limit=' + limit : '';
        filters += '&disability=' + disability;
        filters += '&promoted=' + promoted;
        filters += rating > 0 ? '&rating=' + rating : '';
        filters += search != '' ? '&name=' + search : '';

        setPage(1)
        setFilters(filters)
    }

    const onPageChange = (page: number) => {
        setPage(page)
        let filters = ""

        filters += page > 0 ? '?page=' + page : '';
        filters += limit > 0 ? '&limit=' + limit : '';
        filters += '&disability=' + disability;
        filters += '&promoted=' + promoted;
        filters += rating > 0 ? '&rating=' + rating : '';
        filters += search != '' ? '&name=' + search : '';

        setFilters(filters)
    }

    const closeInvite = () => {
        setShowModal(false)
    }

    const onLimitChange = (limit: number) => {
        setLimit(limit);
    };

    return (
        <>
            <div className={`card ${!isDashboard && 'forpadding'}`}>
                <div className='card first-card card-header'>
                    <div className='card-left-heading'>
                        <h3>{userType === 'talent-requestors' ? 'TalentRequestors' : 'TalentedXperts'}</h3>
                    </div>
                </div>
                <FilterCard setPromoted={setPromoted} promoted={promoted} disability={disability} setDisability={setDisability} rating={rating} setRating={setRating} setSearch={setSearch} userType={userType}/>
                <div className='card-bodyy my-active-task py-1 ps-2 pe-4 '>
                    <div className='row'>
                        {!loading && users?.users?.length > 0 ?
                            users?.users?.map((use: any) => <UsersCard key={use?.id} use={use} userType={userType} user={user} setUserId={setUserId} setShowModal={setShowModal} />)
                            : !loading ? <NoFound message={'No Record Found'} /> : null
                        }
                    </div>
                </div>
                {isAuth && showModal && <InviteModal userId={userId} isOpen={showModal} onClose={closeInvite} />}
            </div>
            {users?.count > 0 && <Pagination count={users?.count} page={page} limit={limit} onPageChange={onPageChange} onLimitChange={onLimitChange} siblingCount={1} />}
        </>
    )
}

export default Talentedxperts
