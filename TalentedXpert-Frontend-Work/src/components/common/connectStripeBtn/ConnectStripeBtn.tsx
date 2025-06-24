'use client'
import { Icon } from '@iconify/react';
import { setUser } from '@/reducers/UserSlice'
import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { RootState, useAppDispatch } from '@/store/Store'
import { usePathname, useRouter } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigation } from '@/hooks/useNavigation';

const ConnectStripeBtn:FC<any> = ({ isSetting }) => {
    const user = useSelector((state: RootState) => state.user)
    const [data, setData] = useState<any>(null)

    const router = useRouter()
    const pathName = usePathname()
    const { navigate } = useNavigation()

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (user?.stripeAccountId !== null) {
            getConnectAccountInfo(user?.stripeAccountId)
        }
    }, [user])

    const getConnectAccountInfo = (id: any) => {
        id && apiCall(`${requests?.connectStripeAccount}`, {}, 'get', false, dispatch, user, router).then(res => {
            if (res?.error?.message) {
                return;
            } else {
                setData({
                    id: user?.id,
                    card_payments: res?.data?.data?.capabilities?.card_payments,
                    created: res?.data?.data?.created
                })
            }
        }).catch(err => {
            console.warn(err)
        })
    }

    const connectExpressAccount = () => {
        let param = {
            refreshUrl: process.env.DOMAIN + pathName,
            returnUrl: process.env.DOMAIN + pathName,
            type: 'account_onboarding'
        }
        apiCall(`${requests?.connectStripeAccount}`, param, 'post', false, dispatch, user, router).then(res => {
            if (res?.error?.message) {
                return;
            } else {
                if (res?.data?.url) {
                    navigate(res?.data?.url)

                    // Once the user returns from the onboarding, ensure `getProfileData` is called
                    setTimeout(() => {
                        if (!data) {
                            getUserDetails();
                        }
                    }, 60000);
                }
            }
        }).catch(err => {
            console.warn(err)
        })
    }

    const getUserDetails = async () => {
        await apiCall(requests.getUserInfo, {}, 'get', false, dispatch, user, router).then((res: any) => {
            if (res?.error) {
                return;
            } else {
                dispatch(setUser(res?.data))
            }
        }).catch(err => console.warn(err))
    }

    return (
        <>
            <p>
                Stripe Account Status:
                <span className={`${data?.card_payments === 'active' ? "verified" : "pending"} fs-14 bg-gray py-1 px-2 ms-2`}>
                    {data?.card_payments === 'active' ? 'Verified' : 'Pending'}
                    {data?.card_payments === 'inactive' ? <Icon icon="bi:info-circle" width="16" height="16" /> : null}
                </span>
            </p>
            <div className={`${isSetting ? '' : ' mt-3'}`}>
                <button type='button' className={`btn rounded-pill btn-info ${isSetting ? '' : 'mt-2'}`} onClick={connectExpressAccount}>{user?.stripeAccountId !== null && 'Update '}Connect Account</button>
            </div>
        </>
    )
}

export default ConnectStripeBtn