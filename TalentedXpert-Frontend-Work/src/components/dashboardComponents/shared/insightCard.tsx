import React, { FC, useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import GlobalLoader from '@/components/common/GlobalLoader/GlobalLoader';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import { useRouter } from 'next/navigation';

const InsightCard: FC<any> = ({ insideCard }) => {
    const { navigate } = useNavigation()
    const router = useRouter();
    const dispatch = useAppDispatch();

    const user = useSelector((state: RootState) => state.user);

   const [articles, setArticles] = useState<any>({})


    const [wallet, setWallet] = useState<any>({})
    useEffect(() => {
        getWallet()
        getArticles()
    }, [])

     const getArticles = async () => {
        try {
            const response = await apiCall(requests?.articles, { profileId: user?.profile[0]?.id }, 'get', false, dispatch, user, router);
            console.log('article count', response?.data?.data?.articles)
            setArticles( response?.data?.data?.articles)
            // setArticle(response?.data?.data?.articles || []);
        } catch (error) {
            console.warn("Error fetching articles:", error);
        }

    }

    const getWallet = async () => {
        await apiCall(
            `${requests.wallet}`,
            {},
            "get",
            false,
            dispatch,
            user,
            router
        )
            .then((res: any) => {
                if (res?.error) {
                    return;
                } else {
                    console.log(res?.data?.data || []);
                    setWallet(res?.data?.data)
                }
            })
            .catch((err) => console.warn(err));
    };


    return (

        <section className="promoted_te_section pb-3">
            <div className="row">
                {insideCard.map((data: any, index: number) => (
                    <div className="col-sm-6 col-xl-3 mb-2" key={index}>
                        <div className="promoted_card">
                            <Link href={data?.url} className="card_heading top-cards" onClick={() => navigate(data?.url)}>
                                <div className="dib">
                                    {data?.icon?.includes(':') ?
                                        <span className={`bg-white text-dark rounded-pill fs-2 p-lg-3 p-md-1`}>
                                            <Icon className='me-4' icon={data?.icon} />
                                        </span>
                                        :
                                        <span className={`material-symbols-outlined bg-white text-dark rounded-pill fs-2 p-lg-3 p-md-1`}>
                                            {data?.icon}
                                        </span>
                                    }
                                    <div className="victorimgup"></div>
                                </div>
                                <h5 className='text-white'>{data?.text}</h5>
                                {wallet?.availableBalance  > 0 && <h5 className='text-white'>{data?.text == 'Wallet' ? '($ ' + Math.floor(wallet.availableBalance) + ')' : ''}</h5>}
                                {articles?.length > 0 && <h5 className='text-white'>{data?.text == 'Articles' ? '( ' + articles?.length + ' )' : ''}</h5> } 
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default InsightCard
