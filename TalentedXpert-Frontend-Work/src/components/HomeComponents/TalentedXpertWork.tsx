import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'

const TalentedXpertWork = () => {
  return (
    <section className="how_te_works bg-light text-center py-5">
          <div className="container">
            <h2>How TalentedXpert Works</h2>
            <div className="row py-5 mt-5">
              <div className="col col-sm-6 col-lg-3">
                {/* <span className="material-symbols-outlined bg-dark text-white rounded-pill fs-2 p-3 mb-4">
                  group_add
                </span> */}
                <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                  <Icon icon="octicon:person-add-24" className="text-light fs-3 d-flex" />
                </div>
                <h6 className="fs-5 mt-3">Create Profile</h6>
                <div className="victorimgup d-none d-lg-block"></div>
              </div>
              <div className="col col-sm-6 col-lg-3">
                {/* <span className="material-symbols-outlined bg-dark text-white rounded-pill fs-2 p-3 mb-4">
                  approval_delegation
                </span> */}
                <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                  <Icon icon="ph:cloud-arrow-up" className="text-light fs-3 d-flex" />
                </div>
                <h6 className="fs-5 mt-3">Apply For task</h6>
                <div className="victorimgdown d-none d-lg-block"></div>
              </div>
              <div className="col col-sm-6 col-lg-3">
                {/* <span className="material-symbols-outlined bg-dark text-white rounded-pill fs-2 p-3 mb-4">
                  arrow_upload_progress
                </span> */}
                <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                  <Icon icon="mdi:search-add-outline" className="text-light fs-3 d-flex" />
                </div>
                <h6 className="fs-5 mt-3">Perform Task</h6>
                <div className="victorimgup d-none d-lg-block"></div>
              </div>
              <div className="col col-sm-6 col-lg-3">
                {/* <span className="material-symbols-outlined bg-dark text-white rounded-pill fs-2 p-3 mb-4">
                  credit_score
                </span> */}
                <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                  <Icon icon="majesticons:settings-cog-check-line" className="text-light fs-3 d-flex" />
                </div>
                <h6 className="fs-5 mt-3">Receive Payment</h6>
              </div>
            </div>
          </div>
        </section>
  )
}

export default TalentedXpertWork
