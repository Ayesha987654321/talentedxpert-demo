'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/Store';
import { useRouter } from 'next/navigation';
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import NoFound from '../../common/NoFound/NoFound';
import RatingStar from '@/components/common/RatingStar/RatingStar';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Pagination } from '@/components/common/Pagination/Pagination';
import ImageFallback from '@/components/common/ImageFallback/ImageFallback';

const AllReviews = () => {
  const user = useSelector((state: RootState) => state.user);
  const [reviews, setReviews] = useState<any>([]);
  const [rating, setRating] = useState<number>(0);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false)

  const [limit, setLimit] = useState<number>(10)
  const [page, setPage] = useState<number>(1)
  const [filters, setFilters] = useState<string>('')

  const getReviews = async (params: any) => {
    try {
      setLoading(true);
      const response = await apiCall(requests?.reviews + params, {}, 'get', false, dispatch, user, router);
      setReviews(response?.data?.data || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters && filters != "") {
      getReviews(filters);
    }
  }, [filters]);

  useEffect(() => {
    setFilterParams();
  }, [limit, rating])

  const setFilterParams = () => {
    let filters = ""
    filters += '?page=' + 1 || '';
    filters += limit > 0 ? '&limit=' + limit : '';
    filters += rating > 0 ? '&rating=' + rating : '';
    setPage(1)
    setFilters(filters)
  }

  const onPageChange = (page: number) => {
    setPage(page)
    let filters = ""

    filters += page > 0 ? '?page=' + page : '';
    filters += limit > 0 ? '&limit=' + limit : '';
    filters += rating > 0 ? '&rating=' + rating : '';

    setFilters(filters)
  }

  const onLimitChange = (limit: number) => {
    setLimit(limit);
  };

  return (
    <div className="card p-4 bg-dark text-white">
      <div className="first-card card-header d-lg-flex d-md-flex d-sm-flex justify-content-between px-4 bg-gray">
        <h3 className="card-left-heading mb-0">Reviews</h3>
      </div>
      <div className='filtersearch d-flex align-items-center justify-content-between flex-wrap p-2'>
        <div className='filters d-flex align-items-center '>
          <select className="form-select form-select-sm" onChange={(e) => setRating(Number(e.target.value))} value={rating}>
            <option value={0}>Rating</option>
            <option value={3}>3 stars</option>
            <option value={4}>4 stars</option>
            <option value={5}>5 stars</option>
          </select>
        </div>
      </div>
      {reviews?.reviews?.length > 0 ? (
        <div className="card-body py-2">
          {reviews?.reviews?.map((data: any, index: number) => {
            if (!data?.task || !data?.reviewerProfile?.id) return null;
            return (
              <div className="review row align-items-start py-4 px-3 mb-2 border-secondary" key={index}>
                {/* Left Section - Profile Picture, Name, Rating, Comment */}
                <div className="col-md-8 d-flex">
                  {/* Profile Picture */}
                  <div className="d-flex flex-column align-items-center">
                    <ImageFallback
                      src={data?.reviewerProfile?.user?.profilePicture?.fileUrl}
                      alt="User"
                      className="rounded-circle"
                      width={60}
                      height={60}
                      priority
                      userName={data?.reviewerProfile?.user ? `${data?.reviewerProfile?.user?.firstName} ${data?.reviewerProfile?.user?.lastName}` : null}
                    />
                  </div>

                  {/* Name, Rating, and Comment */}
                  <div className="ms-3">
                    <h5 className="mb-1">{data?.reviewerProfile?.user?.firstName} {data?.reviewerProfile?.user?.lastName}</h5>
                    <RatingStar rating={data?.rating} />
                    <p className="text-white small mt-2">{data?.comments}</p>
                  </div>
                </div>

                {/* Right Section - Vertical Line & Task Name */}
                <div className="col-md-4 d-flex align-items-center">
                  <div className="vr mx-4" style={{ height: '100px', width: '2px', background: '#666' }}></div>

                  <div>
                    <h6 className="fw-bold text-light">Task Name:</h6>
                    <p className="mb-1 text-white">{data?.task?.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <NoFound message="No reviews found" />
      )}
      {reviews?.count > 0 && <Pagination count={reviews?.count} page={page} limit={limit} onPageChange={onPageChange} onLimitChange={onLimitChange} siblingCount={1} />}
    </div>
  );
};

export default AllReviews;
