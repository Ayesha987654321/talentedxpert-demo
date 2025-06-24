'use client'
import ImageFallback from '@/components/common/ImageFallback/ImageFallback'
import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { RootState, useAppDispatch } from '@/store/Store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import defaultUserImg from "../../../../../public/assets/images/default-user.jpg"
import HtmlData from '@/components/common/HtmlData/HtmlData'
import MemberList from './MemberList'
import NoFound from '@/components/common/NoFound/NoFound'
import { dynamicBlurDataUrl } from '@/services/utils/dynamicBlurImage'

const ViewTeam = () => {
    const { id } = useParams()

    const [details, setDetails] = useState<any>({})
    const [logoImageBlurDataURL, setLogoImageBlurDataURL] = useState('');
    const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState('');

    const user = useSelector((state: RootState) => state.user)
    const dispatch = useAppDispatch()
    const router = useRouter()

    const getTeam = async (id: number) => {
        await apiCall(requests.teams, { id: id }, 'get', false, dispatch, user, router).then((res: any) => {
            if (res?.data?.data?.teams?.length > 0) {
                setDetails({
                    ...res?.data?.data?.teams[0],
                })
            }
        }).catch(err => console.warn(err))
    }

    useEffect(() => {
        if (id) {
            getTeam(Number(id));
        }
    }, [id])

    useEffect(() => {
        if (details?.logoUrl || details?.createdByProfile?.user?.profilePicture?.fileUrl) {
            fetchBlurDataURL();
        }
    }, [details?.logoUrl, details?.createdByProfile?.user?.profilePicture?.fileUrl]);

    const fetchBlurDataURL = async () => {
        if (details?.logoUrl) {
            const blurUrl = await dynamicBlurDataUrl(details?.logoUrl);
            setLogoImageBlurDataURL(blurUrl);
        }
        if (details?.createdByProfile?.user?.profilePicture?.fileUrl) {
            const blurUrl = await dynamicBlurDataUrl(details?.createdByProfile?.user?.profilePicture?.fileUrl);
            setProfileImageBlurDataURL(blurUrl);
        }
    }

    return (
        <div className='card'>
            <div className='card  card-header bg-gray'>
                <h3 className='text-white'>View Team Details</h3>
            </div>
            <div className='card-bodyy viewtask'>
                <div className="box m-2 p-3">
                    <div className='profile-header d-md-flex justify-content-between mx-md-5 p-4'>
                        <div className='d-md-flex'>
                            <div className='d-flex justify-content-around me-md-5'>
                                <ImageFallback
                                    src={details?.logoUrl}
                                    fallbackSrc={defaultUserImg}
                                    alt="img"
                                    className=" user-img img-round mb-3"
                                    width={100}
                                    height={100}
                                    loading='lazy'
                                    blurDataURL={logoImageBlurDataURL}
                                    userName={details ? details?.name : null}
                                />
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <h5><b>{details.name}</b></h5>
                            </div>
                        </div>
                    </div>
                    <div className='about mx-2 mx-md-4 p-3'>
                        <h4>Description</h4>
                        <HtmlData data={details?.description} />
                    </div>
                    {details?.teamInvitations?.length > 0 ? <div className='about mx-2 mx-md-4 p-3 my-3'>
                        <h4>Invited Members List</h4>
                        {details?.teamInvitations?.length > 0 ?
                            <MemberList data={details?.teamInvitations} type="invited" getTeam={getTeam} id={id} />
                            : <NoFound message={"No Invited Members Found yet"} />
                        }
                    </div> : null}
                    <div className={`about mx-2 mx-md-4 p-3 ${details?.teamInvitations?.length === 0 && 'my-3'}`}>
                        <h4>Members List</h4>
                        {details?.teamMembers?.length > 0 ?
                            <MemberList data={details?.teamMembers} type="members" />
                            : <NoFound message={"No Members Found yet"} />
                        }
                    </div>
                    <div className='about mx-2 mx-md-4 p-3 my-3'>
                        <h4>Created By</h4>
                        <div className='d-md-flex mt-3'>
                            <div className='d-flex justify-content-around me-md-5'>
                                <ImageFallback
                                    src={details?.createdByProfile?.user?.profilePicture?.fileUrl}
                                    fallbackSrc={defaultUserImg}
                                    alt="img"
                                    className=" user-img img-round mb-3"
                                    width={80}
                                    height={80}
                                    loading='lazy'
                                    blurDataURL={profileImageBlurDataURL}
                                    userName={details?.createdByProfile?.user ? `${details?.createdByProfile?.user?.firstName} ${details?.createdByProfile?.user?.lastName}` : null}

                                />
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <div className=''>
                                    <h5><b>{details.createdByProfile?.user?.firstName} {details.createdByProfile?.user?.lastName}</b></h5>
                                    <p>{details.createdByProfile?.user?.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewTeam