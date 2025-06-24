'use client'
import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ImageFallback from '../ImageFallback/ImageFallback';
import RatingStar from '../RatingStar/RatingStar';
import HtmlData from '../HtmlData/HtmlData';
import Link from 'next/link';
import { getTimeago } from '@/services/utils/util';
;
import { useNavigation } from '@/hooks/useNavigation';

const ProjectsSlider = ({ task }: any) => {

    const { navigate } = useNavigation()

    return (
        <>
            <div className='position-relative'>
                <Swiper
                    navigation={{
                        nextEl: '.custom-next',
                        prevEl: '.custom-prev',
                    }}
                    slidesPerView={3}
                    spaceBetween={30}
                    slidesPerGroup={1}
                    loop={task.length >= 3} // Enable loop only if enough slides
                    breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 30,
                        },
                        575: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        767: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        991: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                        1199: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                    }}
                    modules={[Navigation]}
                    className="mySwiper"
                >
                    {task.map((data: any) => (<SwiperSlide key={data.id}>

                        <div className="promoted_card mb-2 position-relative promoted-talented d-flex flex-column h-100 min-height-50 max-height-50 border">
                            {data?.isPromoted && (
                                <div className="ribbon-1 mb-2">
                                    <ImageFallback
                                        src={"/assets/images/promote.svg"}
                                        alt="img"
                                        className="img-fluid ribbon-img"
                                        width={120}
                                        height={130}
                                        priority
                                    />
                                </div>
                            )}
                            <div className="usertext d-flex flex-column h-100">
                                <div className="d-flex justify-content-between align-items-start">
                                    <Link
                                        className="mb-2 mt-2 text-white text-decoration-none"
                                        href={`/tasks/${data?.id}`}
                                        onClick={() => navigate(`/tasks/${data?.id}`)}
                                    >
                                        {data?.name}
                                    </Link>
                                    <div className="d-flex flex-column align-items-end">
                                        <p className="text-white fw-medium mb-1">${data.amount}{data?.amountType=='HOURLY' && '/ hr'}</p>
                                        <h6 className="fs-12 text-secondary mb-0">{getTimeago(data.createdAt)}</h6>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <p className="fs-12 mb-0">
                                        {data?.taskLocation?.country && (
                                            <span className="text-white">{data?.taskLocation?.country?.name}</span>
                                        )}
                                        <span className={data?.taskLocation?.country ? "ms-2" : ""}>{data.taskType}</span>
                                    </p>
                                </div>

                                <RatingStar rating={data?.requesterProfile?.averageRating} />
                                <HtmlData data={data?.details} className="text-white line-clamp-3" />

                                <div className="d-flex align-items-baseline justify-content-between mt-auto"></div>
                            </div>
                        </div>

                    </SwiperSlide>))}




                </Swiper>
                <div className="custom-prev custom-circle">
                    <Icon icon="ph:arrow-left-light" />

                </div>
                <div className="custom-next custom-circle">
                    <Icon icon="ph:arrow-right-light" />

                </div>
            </div>


            <style jsx>{`
        .custom-prev,
        .custom-next {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10;
          font-size: 24px;
          cursor: pointer;
          color: #fff;
        }
        .custom-prev {
          left: -50px;
        }
        .custom-next {
          right: -50px;
        }
        @media (max-width: 575px) {
          .custom-prev,
          .custom-next {
            font-size: 20px;
          }
          .custom-prev {
            left: 5px;
          }
          .custom-next {
            right: 20px;
          }
        }
      `}</style>
        </>
    )
}

export default ProjectsSlider