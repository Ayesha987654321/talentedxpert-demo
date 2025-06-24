import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'

const TalentedRequestorWork = () => {
    return (
        <section className="how_te_works bg-light text-center py-5">
            <div className="container">
                <h2>How TalentRequestor Works</h2>
                <div className="row py-5 mt-5">
                    <div className="col col-sm-6 col-lg-3">
                        <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                            <Icon icon="octicon:person-add-24" className="text-light fs-3 d-flex" />
                        </div>
                        <h6 className="fs-5 mt-4">Create Profile</h6>
                        <div className="victorimgup d-none d-lg-block"></div>
                    </div>
                    <div className="col col-sm-6 col-lg-3">
                        <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                            <Icon icon="ph:cloud-arrow-up" className="text-light fs-3 d-flex" />
                        </div>
                        <h6 className="fs-5 mt-4">Create a Task</h6>
                        <div className="victorimgdown d-none d-lg-block"></div>
                    </div>
                    <div className="col col-sm-6 col-lg-3">
                        <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                            <Icon icon="mdi:search-add-outline" className="text-light fs-3 d-flex" />
                        </div>
                        <h6 className="fs-5 mt-4">Recruit TalentedXpert for Task</h6>
                        <div className="victorimgup d-none d-lg-block"></div>
                    </div>
                    <div className="col col-sm-6 col-lg-3">
                        <div className=" material-symbols-outlined bg-dark rounded-pill  p-3 mb-4 material-icn">
                            <Icon icon="majesticons:settings-cog-check-line" className="text-light fs-3 d-flex" />
                        </div>
                        <h6 className="fs-5 mt-4">Get Task Done and Issue Payment</h6>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TalentedRequestorWork