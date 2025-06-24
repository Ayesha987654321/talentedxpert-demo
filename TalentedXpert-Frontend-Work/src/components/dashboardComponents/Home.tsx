'use client'
import React from 'react'
import InsightCard from './shared/insightCard';
import MyActiveTask from './MyActiveTask';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/Store';
import { insideTECard, insideTRCard } from '@/services/helpers/dashboard';
import { Activeandarticle } from './talentxpertEX/Activeandarticle';

const Home = () => {
    const user = useSelector((state: RootState) => state.user)

    return (
        <>
            <div className='top-card '>
                <InsightCard insideCard={user?.profile?.length > 0 && user?.profile[0]?.type === 'TR' ? insideTRCard : insideTECard} />
            </div>
            {user?.profile?.length > 0 && user?.profile[0]?.type === 'TR' ? <MyActiveTask /> : <Activeandarticle />}
        </>
    )
}

export default Home