import Image from 'next/image'
import React, { FC, useEffect, useState } from 'react'
import { Icon } from '@iconify/react';
import ImageFallback from '@/components/common/ImageFallback/ImageFallback';
import profileImg from "../../public/assets/images/profile-img.png"
import { dynamicBlurDataUrl } from '@/services/utils/dynamicBlurImage';

const TaskCard: FC<any> = ({ data }) => {
    const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState('');
    useEffect(() => {
        if (data?.profilePicture?.fileUrl|| profileImg) {
          fetchBlurDataURL();
        }
      }, [data?.profilePicture, profileImg]);
    
    
      const fetchBlurDataURL = async () => {
        if (data?.profilePicture.fileUrl || profileImg) {
          const blurUrl = await dynamicBlurDataUrl(data?.profilePicture?.fileUrl || profileImg);
          setProfileImageBlurDataURL(blurUrl);
        }
      }

    return (
        <div className='card-bodyy my-active-task '>
            <div className="box mx-3 my-2  "> 
                
                {data.disability && <div className="ribbon ribbon-top-right"><span>Disability</span></div>}

                <div className='row'>


                    <div className='col-lg-1 col-2  '>
                        {data.isPromoted &&
                            <ImageFallback
                                src={data?.profilePicture}
                                fallbackSrc={profileImg}
                                alt="img"
                                className="img-fluid promoteed-tag-img"
                                width={60}
                                height={60}
                                loading="lazy"
                                blurDataURL={profileImageBlurDataURL} />
                        }
                        <div className='text-lg-end card-profile  mt-4 '>
                            <div className='inerprofile text-end'>                                                <Image
                                src={data.src}
                                alt="img"
                                className=" user-img img-round"
                                width={60}
                                height={60}
                                priority
                            />
                                <h2>{data.name}</h2>

                            </div>
                        </div>
                    </div>
                    <div className='col-lg-10 col-9 p-4'>
                        <div className='priceanddate d-flex justify-content-between bordr'>
                            <h4>{data.designation}</h4>
                            <div className='pricedate text-end'>
                                <span>{data.task_age} days ago</span>
                                <h5>${data.rate} / hr</h5>
                            </div>

                        </div>
                        <p>
                            {`A bachelor's degree or higher in computer science, software engineering, or another related field. Hands-on programming experience using relevant languages. Experience using relevant tool suites. Write well-designed, testable code Produce specifications and determine operational feasibility Integrate software components into a fully functional software system Develop software verification plans...`}

                        </p>


                        <div className='card-footer d-flex flex-wrap justify-content-between'>
                            <div>

                                {data.domain.map((data: any, idx: number) => (<button className="btn btn-black rounded-pill ls mt-2 mx-1 " key={idx}>{data}</button>))}

                            </div>


                            <button className="btn rounded-pill btn-outline-info mt-2">View Details<Icon icon="ic:sharp-arrow-forward" /></button>


                        </div>

                    </div>

                </div>
            </div>

        </div>
    )
}

export default TaskCard
