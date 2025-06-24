'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Icon } from '@iconify/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import ImageFallback from '../ImageFallback/ImageFallback';
import { RootState, useAppDispatch } from '@/store/Store'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import HtmlData from '../HtmlData/HtmlData';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';

const PromotedTEslide: React.FC = () => {
  const [users, setUsers] = useState<any>([]);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { navigate } = useNavigation();

  useEffect(() => {
    getAllPromotedTE();
  }, []);

  const getAllPromotedTE = async () => {
    let params = '';
    params += '?promoted=' + true;
    params += '&limit=' + 6;
    // params += '&disability=' + false;

    try {
      const response = await apiCall(
        `${requests.getUserAll}${params}`,
        {},
        'get',
        false,
        dispatch,
        user,
        router
      );
      setUsers(response?.data?.data?.users || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    }
  };

  return (
    <>
      <div className="position-relative">
        <Swiper
          navigation={{
            nextEl: '.custom-next',
            prevEl: '.custom-prev',
          }}
          slidesPerView={3}
          spaceBetween={30}
          slidesPerGroup={1}
          loop={users.length >= 3} // Enable loop only if enough slides
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
          {users?.map((data: any) => (
            <SwiperSlide key={data.id}>
              <div className="promoted_card mb-2 position-relative promoted-talented d-flex flex-column h-100 min-height-50 max-height-50">
                <div className="ribbon-1">
                  <ImageFallback
                    src="/assets/images/promote.svg"
                    alt="img"
                    className="img-fluid ribbon-img"
                    width={255}
                    height={255}
                    priority
                  />
                </div>
                {data?.disability && (
                  <div className="ribbon-2">
                    <span>Disability</span>
                  </div>
                )}
                <div className="card_heading">
                  <div>
                    <ImageFallback
                      src={data?.profilePicture?.fileUrl}
                      className="user-img img-round"
                      width={48}
                      height={48}
                      alt="User Image"
                      userName={data ? `${data?.firstName} ${data?.lastName}` : null}
                    />
                  </div>
                  <div className="usertext mb-3">
                    <h5>
                      {data?.firstName} {data?.lastName}
                    </h5>
                    <h6>{data?.profile[0]?.designation}</h6>
                    <div className="rating">
                      {[...Array(5)].map((_, index) => (
                        <Icon
                          icon="material-symbols-light:kid-star"
                          key={index}
                          className={`text-light ${index < data.rating ? 'rated' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="line-clamp-3">
                  <HtmlData data={data?.about} />
                </div>
                <div className="d-flex align-items-baseline justify-content-between mt-auto">
                  <h6 className="fs-12">Tasks: {data?.profile[0]?.completedTasks}</h6>
                  <Link
                    href={`/talented-xperts/${data?.id}`}
                    className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm ls"
                    onClick={() => navigate(`/talented-xperts/${data?.id}`)}
                  >
                    View Details <Icon icon="line-md:arrow-right" className="ms-1" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
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
  );
};

export default PromotedTEslide;