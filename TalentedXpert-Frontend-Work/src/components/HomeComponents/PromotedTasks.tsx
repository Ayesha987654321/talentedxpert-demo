import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { getTimeago } from '@/services/utils/util'
import { RootState, useAppDispatch } from '@/store/Store'
import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import HtmlData from '../common/HtmlData/HtmlData'
import ImageFallback from '../common/ImageFallback/ImageFallback'
import { useNavigation } from '@/hooks/useNavigation'
import RatingStar from '../common/RatingStar/RatingStar'

const PromotedTasks = () => {
  const [tasks, setTasks] = useState<any>([])

  const dispatch = useAppDispatch()
  const user = useSelector((state: RootState) => state.user)
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);

  const router = useRouter()
  const { navigate } = useNavigation()

  useEffect(() => {
    getAllTasks();
  }, [])

  const getAllTasks = async () => {
    let params = ''
    params += '?promoted=' + true;
    params += '&limit=' + 6;

    try {
      const response = await apiCall(
        `${requests.getTasks}${params}`,
        {},
        'get',
        false,
        dispatch,
        user,
        router
      );
      setTasks(response?.data?.data.tasks || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    } finally {
    }
  };

  return (
    <section className="promoted_te_section py-5">
      <div className="container">
        <h2 className="mb-4">Promoted Tasks</h2>
        <div className="row row-gap-4">
          {tasks?.map((data: any) => (
            <div className="col-md-4" key={data.id}>
              <div className="promoted_task mb-2  d-flex flex-column h-100">
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
                <div className="usertext">
                  <Link className="mb-0 text-white" href={`/tasks/${data?.id}`} onClick={() => navigate(`/tasks/${data?.id}`)}>{data?.name}</Link>
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <p className="fs-12 mb-0">
                      {/* {data.workingSlot}  */}
                      {data?.taskLocation?.country &&
                        <span className="">{data?.taskLocation?.country?.name}</span>
                      }
                      <span className={data?.taskLocation?.country ? "ms-2" : ""}>{data.taskType}</span>
                    </p>
                    <p className="text-white fw-medium mb-0">${data.amount}/ hr</p>
                  </div>
                  <RatingStar rating={data?.requesterProfile?.averageRating} />
                </div>
                <HtmlData data={data?.details} className='text-white line-clamp-3' />
                <div className="d-flex align-items-baseline justify-content-between mt-auto">
                  <h6 className="fs-12 text-secondary">{getTimeago(data.createdAt)}</h6>
                  {((user?.profile && user?.profile[0].type == 'TE') || !isAuth) ?
                    <Link className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm ls mt-1" href={isAuth ? `/tasks/${data.id}` : '/signin'} onClick={() => navigate(isAuth ? `/tasks/${data.id}` : '/signin')}>
                      Apply Now <Icon icon="line-md:arrow-right" className='ms-1' />
                    </Link>
                    : null
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="buttondiv text-end mt-4">
          {tasks?.length <= 6 && <Link className="btn btn-info rounded-pill" href={"/tasks"} onClick={() => navigate('/tasks')}>View All</Link>}
        </div>
      </div>
    </section>
  )
}

export default PromotedTasks
