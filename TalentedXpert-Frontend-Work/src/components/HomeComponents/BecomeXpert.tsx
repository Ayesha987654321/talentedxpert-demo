import { useNavigation } from '@/hooks/useNavigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import React from 'react'

const BecomeXpert = () => {
  const { navigate } = useNavigation()

  return (
    <section className="become-section py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 mb-2">
            <div className="card bg-become-expert">
              <div className="card-body">
                <div className="row">
                  <div className="col-8">
                    <h5 className="fw-bold become-text">Become a TalentedXpert</h5>
                    <p className='line-clamp-2'>Master your craft by honing your skills, staying updated, and providing expert solutions in your field</p>
                    <Link href={'/register'} onClick={() => navigate('/register')} className="btn btn-info rounded-pill become-btn">
                      Register Now <Icon icon="material-symbols:arrow-right-alt-rounded" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-2">
            <div className="card bg-become-requester">
              <div className="card-body">
                <div className="row text-light">
                  <div className="col-8">
                    <h5 className="fw-bold become-text">Become a TalentRequestor</h5>
                    <p className="text-light line-clamp-2 ">Improve your ability to articulate needs clearly, request relevant information, and effectively collaborate</p>
                    <Link href={'/register'} onClick={() => navigate('/register')} className="btn btn-info rounded-pill become-btn">
                      Register Now <Icon icon="material-symbols:arrow-right-alt-rounded" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BecomeXpert
