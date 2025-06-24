'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react'
import FilterCard from './FilterCard';
import TeamTable from './TeamTable';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { RootState, useAppDispatch } from '@/store/Store';
import { useSelector } from 'react-redux';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useRouter } from 'next/navigation';
import { teamMenu } from '@/services/helpers/teamsMenuTab';
import { useNavigation } from '@/hooks/useNavigation';

const Teams = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [limit, setLimit] = useState<number>(10)
    const [page, setPage] = useState<number>(1)
    const [filters, setFilters] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [teams, setTeams] = useState<any>([]);
    const { navigate } = useNavigation()

    const [activeTab, setActiveTab] = useState<string>('created')

    const user = useSelector((state: RootState) => state.user)
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        if (filters && filters != "") {
            activeTab !== 'Invites' ? getAllTeams(filters)
                : getAllInvites(filters)
        }
    }, [filters])

    useEffect(() => {
        setName('')
    }, [activeTab]);

    const setFilterParams = () => {
        let filters = ""

        filters += '?page=' + 1 || '';
        filters += limit > 0 ? '&limit=' + limit : '';
        filters += activeTab !== 'Invites' ? '&type=' + activeTab : '';
        filters += name ? '&name=' + name : '';

        setPage(1)
        setFilters(filters)
    }

    useEffect(() => {
        setFilterParams();
    }, [limit, activeTab, name])

    const getAllTeams = async (params: any) => {
        try {
            setTeams('')
            const response = await apiCall(
                `${requests.teams}${params}`,
                {},
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
        }
    }

    const getAllInvites = async (params: any) => {
        try {
            setLoading(true);
            setTeams('')
            const response = await apiCall(
                `${requests.invitation}s${params}`,
                {},
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

    const onPageChange = (page: number) => {
        setPage(page)
        let filters = ""

        filters += page > 0 ? '?page=' + page : '';
        filters += limit > 0 ? '&limit=' + limit : '';
        filters += activeTab !== 'Invites' ? '&type=' + activeTab : '';
        filters += name ? '&name=' + name : '';

        setFilters(filters)
    }

    const onLimitChange = (limit: number) => {
        setLimit(limit);
    };

    const handleAction = (type: string) => {
        if (type === 'Invites') {
            getAllInvites(filters)
            // setActiveTab('member')
        }
    }

    return (
        <section className=''>
            <div className='card'>
                <div className="card-header bg-dark text-light d-flex flex-wrap align-items-center justify-content-between">
                    <h5 className='mb-0 me-5'>Teams</h5>
                    <Link href='/dashboard/teams/add' onClick={() => navigate('/dashboard/teams/add')}>
                        <div className='card-right-heading d-flex justify-content-between bg-info dispute-btn card-right-heading bg-info text-white  d-flex justify-content-between add-new '>
                            <span className=''>Add New Team </span>
                            <Icon icon="line-md:plus-square-filled" className='text-black' width={32} height={32} />
                        </div>
                    </Link>
                </div>
                <div className="card-body bg-gray">
                    <div className='tab-card'>
                        <ul className="nav nav-pills mt-3" id="pills-tab" role="tablist">
                            {teamMenu.map((value: any) => (
                                <li className="nav-item" role="presentation" key={value?.id}>
                                    <button
                                        className={`nav-link ${value?.type === activeTab ? 'active' : ''}`}
                                        id={`pills-${value?.type}-tab`}
                                        data-bs-toggle="pill"
                                        data-bs-target={`#pills-${value?.type}`}
                                        type="button"
                                        role="tab"
                                        aria-controls={`pills-${value?.type}`}
                                        aria-selected={value?.type === activeTab}
                                        onClick={() => setActiveTab(value?.type)}
                                    >
                                        {value?.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {activeTab !== "Invites" && <FilterCard name={name} setName={setName} />}
                    <TeamTable data={teams?.teams || teams?.invitations || []} type={activeTab} handleAction={handleAction} />
                    <Pagination count={teams?.count} page={page} limit={limit} onPageChange={onPageChange} onLimitChange={onLimitChange} siblingCount={1} />
                </div>
            </div>
        </section>
    )
}

export default Teams