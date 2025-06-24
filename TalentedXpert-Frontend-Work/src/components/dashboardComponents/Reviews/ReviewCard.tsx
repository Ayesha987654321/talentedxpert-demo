import ImageFallback from '@/components/common/ImageFallback/ImageFallback'
import RatingStar from '@/components/common/RatingStar/RatingStar'
import { dynamicBlurDataUrl } from '@/services/utils/dynamicBlurImage';
import React, { FC, useEffect, useState } from 'react'
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";

const ReviewCard: FC<any> = ({ data }) => {    
    const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState('');

    useEffect(() => {
        if (data?.reviewerProfile?.user?.profilePicture?.fileUrl) {
            fetchBlurDataURL();
        }
    }, [data?.reviewerProfile?.user?.profilePicture?.fileUrl]);

    const fetchBlurDataURL = async () => {
        if (data?.reviewerProfile?.user?.profilePicture?.fileUrl) {
            const blurUrl = await dynamicBlurDataUrl(data?.reviewerProfile?.user?.profilePicture?.fileUrl);
            setProfileImageBlurDataURL(blurUrl);
        }
    }

    return (
        <div className="review row align-items-start py-4 px-3 mb-2 border-secondary" key={data?.id}>
            {/* Left Section - Profile Picture, Name, Rating, Comment */}
            <div className="col-md-8 d-flex">
                {/* Profile Picture */}
                <div className="d-flex flex-column align-items-center">
                    <ImageFallback
                        src={data?.reviewerProfile?.user?.profilePicture?.fileUrl}
                        fallbackSrc={defaultUserImg}
                        alt="User"
                        className="rounded-circle"
                        width={60}
                        height={60}                        
                        loading='lazy'
                        blurDataURL={profileImageBlurDataURL}
                        userName={data?.reviewerProfile?.user ? `${data?.reviewerProfile?.user?.firstName} ${data?.reviewerProfile?.user?.lastName}` : null}
                    />
                </div>
                {/* Name, Rating, and Comment */}
                <div className="ms-3">
                    <h5 className="mb-1">{data?.reviewerProfile?.user?.firstName} {data?.reviewerProfile?.user?.lastName}</h5>
                    <RatingStar rating={data?.rating} />
                    <p className="text-white small mt-2">{data?.comments}</p>
                </div>
            </div>
            {/* Right Section - Vertical Line & Task Name */}
            <div className="col-md-4 d-flex align-items-center">
                <div className="vr mx-4" style={{ height: '100px', width: '2px', background: '#666' }}></div>
                <div>
                    <h6 className="fw-bold text-light">Task Name:</h6>
                    <p className="mb-1 text-white">{data?.task?.name}</p>
                </div>
            </div>
        </div>
    )
}

export default ReviewCard