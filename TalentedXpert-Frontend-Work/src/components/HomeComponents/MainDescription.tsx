import { Icon } from '@iconify/react/dist/iconify.js'
import heroimg from "../../../public/assets/images/heroimg.png";
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ImageFallback from '../common/ImageFallback/ImageFallback';
import { useNavigation } from '@/hooks/useNavigation';

const MainDescription = () => {
  const { navigate } = useNavigation()

  return (
    <section className="herosection forpadding pb-5">
      <div className="container-fluid p-0">
        <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <ImageFallback
                src="/assets/images/heroimg.png"
                alt="img"
                className="img-fluid mb-3"
                width={1920}
                height={350}
                priority
              />
            </div>
            <div className="carousel-item">
              <ImageFallback
                src="/assets/images/heroimg2.png"
                alt="img"
                className="img-fluid mb-3"
                width={1920}
                height={350}
                priority
              />
            </div>
            <div className="carousel-item">
              <ImageFallback
                src="/assets/images/heroimg3.png"
                alt="img"
                className="img-fluid mb-3"
                width={1920}
                height={350}
                priority
              />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
        <div className="hero-content">
          <div className="d-flex justify-content-center flex-wrap">
            <div className="hero-content mx-3">
              <div className="d-flex justify-content-center flex-wrap flex-sm-nowrap">
                <div className="herocard">
                  <h1>Why TalentedXpert?</h1>
                  <p className='line-clamp-3'>
                    Because we deliver exceptional talent quickly and efficiently..
                  </p>
                  <a href="/readMore">
                    Read more
                    <Icon icon="line-md:arrow-right" />
                  </a>
                </div>
                <div className="v-divider d-block"></div>
                <div className="herocard">
                  <h1>What is TalentedXpert?</h1>
                  <p className='line-clamp-3'>
                    TalentedXpert connects businesses with top-tier talent, providing..
                  </p>
                  <a href="/readMore">
                    Read more
                    <Icon icon="line-md:arrow-right" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="buttons">
            <Link
              className="btn btn-dark rounded-pill hero-btn"
              href={'/talented-xperts'}
              onClick={() => navigate('/talented-xperts')}
            >Find your TalentedXperts</Link>
            <Link
              className="btn btn-light rounded-pill hero-btn find-yournext-task-btn"
              href={'/tasks'}
              onClick={() => navigate('/tasks')}
            >Find your next Task</Link>
            <Link className="btn btn-info rounded-pill hero-btn" href={'/register'} onClick={() => navigate('/register')}>Join Us Now</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MainDescription
