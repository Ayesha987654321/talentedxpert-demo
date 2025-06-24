import React, { useEffect, useState } from "react";
import MyActiveTask from "../MyActiveTask";
import { Articlelist } from "./Articlelist";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import Tasks from "../tasks";
import { requests } from "@/services/requests/requests";
import apiCall from "@/services/apiCall/apiCall";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import ListCards from "../Articles/ListCards";

export const Activeandarticle = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<string>("");
  const [tasks, setTasks] = useState<any>([]);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // useEffect(() => {
  //     let filters = "?status=INPROGRESS"
  //     filters += '&profileType=' + `${user?.profile?.length > 0 && user?.profile[0]?.type}`
  //     getAllTasks(filters)

  // }, [])

  const getAllTasks = async (params: any) => {
    try {
      setLoading(true);
      const response = await apiCall(
        `${requests.getTaskOnStatus}${user?.id}${params}`,
        {},
        "get",
        false,
        dispatch,
        user,
        router
      );
      setTasks(response?.data?.data || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="row">
        <div className="col-md-8">
          <div className="card h-100">
            {/* <div className="card-header bg-dark text-light  ">
                            <h5 className='mb-0'>My Active Tasks  ({tasks.count})</h5>
                        </div> */}
            <Tasks isactive={true} topMenu={false} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card article-card">
            <div className="card-header bg-dark text-light">
              <h5 className="mb-0">Articles</h5>
            </div>
            <div className="card-body bg-gray">
              <ListCards type={"small"} />
              {/* <div className='card bg-dark'>
                                <div className='card-body'>
                                    <label className="form-check-label text-light fs-14" htmlFor="flexCheckDefault">
                                        Write headlines with words that resonate
                                    </label>
                                    <div className='border-bottom my-2'></div>
                                    <p className='text-light fs-12'>It makes sense. Audiences are seeking information that will help them in their lives, and they have a lot of ...</p>
                                    <div className='d-flex align-items-center justify-content-around flex-wrap'>
                                        <div className='d-flex flex-wrap mb-2 mb-md-0'>
                                            <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2 mb-2">Networking</button>
                                            <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2 mb-2">Development</button>
                                            <button type="button" className="btn btn-gray text-light btn-sm rounded-pill me-2 mb-2">AI blockchain</button>
                                        </div>
                                        <div className='d-flex mb-2'>
                                            <Icon icon="ri:facebook-fill" className='me-2 text-light' />
                                            <Icon icon="lets-icons:insta" className="me-2 text-light" />
                                            <Icon icon="mdi:twitter" className="me-2 text-light" />
                                            <Icon icon="mdi:youtube" className='me-2 text-light' />
                                        </div>
                                        </div>
                                        <div className='text-end '>
                                            <button className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm">
                                                View Details  <Icon icon="line-md:arrow-right" className='ms-1' />
                                            </button>
                                        </div>
                                    
                                </div>
                            </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
