import { Icon } from '@iconify/react/dist/iconify.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { clientTest } from '@/services/helpers/staticdata';
import 'swiper/css';
import 'swiper/css/navigation';
import Image from 'next/image'
import ImageFallback from '../ImageFallback/ImageFallback';


const ClientTestimonialSlider = () => {
  return (
    <div>
      <div className="position-relative">
        <Swiper
          navigation={{
            nextEl: '.custom-next',
            prevEl: '.custom-prev',
          }}
          slidesPerView={3}
          spaceBetween={30}
          slidesPerGroup={1}
          loop={true}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 30
            },
            575: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            767: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            991: {
              slidesPerView: 3,
              spaceBetween: 30
            },
            1199: {
              slidesPerView: 3,
              spaceBetween: 30
            }
          }}
          modules={[Navigation]}
          className="mySwiper"
        >
          {clientTest.map((data: any) => (
            <SwiperSlide key={data.id}>
              <div className="promoted_card mb-2">
                <div className="card_heading">
                  <div className="userimg">
                    <ImageFallback
                      src={data.src}
                      className="user-img"
                      width={48}
                      height={48}
                      alt="User Image"
                    />
                  </div>
                  <div className="usertext">
                    <p className="mb-1 fs-12 clients-text">{data.name}</p>
                    <p className="fs-12 clients-text">{data.designation}</p>
                  </div>
                  {/* <Icon icon="material-symbols:format-quote" className="text-white ms-auto comma-icn" /> */}
                  {/* <Image
                    src="assets/images/quote.svg"
                    width={48}
                    height={48}
                    alt="User Image"
                    className='ms-auto'
                  /> */}
                  <ImageFallback
                      src="assets/images/quote.svg"
                      alt="User Image"
                      className="ms-auto"
                      width={28}
                      height={28}
                      priority
                    />
                </div>
                <div className="rating">
                  {[...Array(5)].map((_, index) => (
                    <Icon
                      icon="material-symbols-light:kid-star"
                      key={index}
                      className={`text-light me-1 ${index < data.rating ? "rated" : ""}`}
                    />
                  ))}
                </div>
                <p className="line-clamp-3">
                  {data.description} <a href="#">more</a>
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom navigation buttons */}
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
    </div>
  );
};

export default ClientTestimonialSlider;
