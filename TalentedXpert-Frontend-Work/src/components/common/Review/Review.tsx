import React, { FC, useEffect, useState } from 'react'
import ImageFallback from '../ImageFallback/ImageFallback'
import RatingStar from '../RatingStar/RatingStar'
import defaultUserImg from "../../../../public/assets/images/default-user.jpg"
import profileImg from "../../../../public/assets/images/profile-img.png"
import { dynamicBlurDataUrl } from '@/services/utils/dynamicBlurImage'

const Review: FC<any> = ({ reviewReceive }) => {
    const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState('');

    useEffect(() => {
        if (reviewReceive?.reviewerProfile?.user?.profilePicture?.fileUrl || profileImg) {
            fetchBlurDataURL();
        }
    }, [reviewReceive?.reviewerProfile?.user?.profilePicture?.fileUrl, profileImg]);

    const fetchBlurDataURL = async () => {
        if (reviewReceive?.reviewerProfile?.user?.profilePicture?.fileUrl || profileImg) {
            const blurUrl = await dynamicBlurDataUrl(reviewReceive?.reviewerProfile?.user?.profilePicture?.fileUrl || profileImg);
            setProfileImageBlurDataURL(blurUrl);
        }
    }

    return (
        <div className='review mx-2  p-3 mt-3'>
            <div className="d-flex">
                <div>
                    <ImageFallback
                        src={reviewReceive?.reviewerProfile?.user?.profilePicture?.fileUrl}
                        fallbackSrc={defaultUserImg}
                        alt="img"
                        className="user-img img-round me-3"
                        width={40}
                        height={40}
                        loading='lazy'
                        blurDataURL={profileImageBlurDataURL}
                        userName={reviewReceive?.reviewerProfile?.user ? `${reviewReceive?.reviewerProfile?.user?.firstName} ${reviewReceive?.reviewerProfile?.user?.lastName}` : null}
                    />
                </div>
                <div className="text-light d-flex justify-content-between">
                    <div>
                        <h6>
                            {reviewReceive?.reviewerProfile?.user?.firstName}{" "}
                            {reviewReceive?.reviewerProfile?.user?.lastName}
                        </h6>
                        <div className="">
                            <div className="rating">
                                <RatingStar rating={reviewReceive?.rating} />
                            </div>
                        </div>
                        <span>{reviewReceive?.comments}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Review
