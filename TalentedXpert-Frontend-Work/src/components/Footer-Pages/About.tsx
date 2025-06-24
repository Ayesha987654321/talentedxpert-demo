import React from 'react'
import ImageFallback from '../common/ImageFallback/ImageFallback'

const About = () => {
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
      </div>
      <h1 className='text-center'>Coming Soon...</h1>
      </section>
  )
}

export default About
