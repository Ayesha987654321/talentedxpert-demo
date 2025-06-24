'use client'
import apiCall from '@/services/apiCall/apiCall'
import { category } from '@/services/helpers/staticdata'
import { requests } from '@/services/requests/requests'
import { RootState, useAppDispatch } from '@/store/Store'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const Categories = () => {
  const [categories, setcategories] = useState<any>([])
  const dispatch = useAppDispatch();
  const router = useRouter()
  const user = useSelector((state: RootState) => state.user)

  const getCategory = async (level: number) => {
    await apiCall(`${requests.getCategory}?level=${level}`, {}, 'get', false, dispatch, user, router).then((res: any) => {
      setcategories(res?.data?.data?.categories || [])
    }).catch(err => console.warn(err))
  }

  useEffect(() => {
    getCategory(1)
  }, [])

  return (
    <section className="categories_te_section bg_tertiary py-5">
      <div className="container">
        <h2 className="mb-4">Categories</h2>
        <div className="row row-gap-4">
          {categories?.length <= 6 && categories?.map((data: any, index: number) => (
            <div className="col-md-4" key={data.id}>
              <div className={`card ${data.isDark ? "bg-dark text-light" : "bg-light text-dark"}  border-0`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {/* <span className="material-symbols-outlined fs-1">devices</span> */}
                    <Icon icon={category[index].icon} className="fs-1" />
                    <h6 className="ms-3 mb-0">{data.name}</h6>
                  </div>
                  <p className={`line-clamp-3 mb-0 ${data.isDark ? "text-light" : ""}`}>{category[index].description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="buttondiv text-end mt-4">
          {/* {categories?.length <= 6 && <button className="btn btn-info rounded-pill">View All</button>} */}
        </div>
      </div>
    </section>
  )
}

export default Categories
