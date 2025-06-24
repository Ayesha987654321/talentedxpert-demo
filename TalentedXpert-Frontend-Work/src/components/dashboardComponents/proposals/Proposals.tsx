"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { getTimeago } from "@/services/utils/util";
import { Pagination } from "@/components/common/Pagination/Pagination";
import SkeletonLoader from "@/components/common/SkeletonLoader/SkeletonLoader";
import NoFound from "@/components/common/NoFound/NoFound";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import { ProposalStatus } from "@/services/enums/enums";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import RatingStar from "@/components/common/RatingStar/RatingStar";
import { useNavigation } from "@/hooks/useNavigation";
import GlobalLoader from "@/components/common/GlobalLoader/GlobalLoader";

const Proposals = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [proposals, setProposals] = useState<any>([]);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loadingg, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<string>("");
  const [Task, setTask] = useState<any>([]);
  const { navigate } = useNavigation();

  useEffect(() => {
    if (filters && filters != "") {
      getProposals(filters);
      if (id) {
        getTask();
      }
    }
  }, [filters]);

  const setFilterParams = () => {
    let filters = "";

    // filters += '?page=' + 1 || '';
    // filters += limit > 0 ? '&limit=' + limit : '';
    filters += Number(id) > 0 ? "?taskId=" + Number(id) : "";
    filters += status !== "" ? "&status=" + status : "";

    setPage(1);

    setFilters(filters);
  };

  useEffect(() => {
    setFilterParams();
  }, [limit, status]);

  const getProposals = async (params: any) => {
    try {
      setLoading(true);
      const response = await apiCall(
        `${requests.getProposals}${params}`,
        {},
        "get",
        false,
        dispatch,
        user,
        router
      );
      setProposals(response?.data?.data || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };
  const getTopProposals = async () => {
    const data = {
      job_description: Task?.details,
      proposals: Object.fromEntries(
        proposals?.proposals?.map((prop: any) => [prop?.id, prop?.details]) ||
          []
      ),
    };

    try {
      setLoading(true);
      const response = await apiCall(
        requests?.topProposal,
        data,
        "post",
        false,
        dispatch,
        user,
        router
      );

      if (response?.data?.top_proposal) {
        const sortedProposalIds = response?.data?.top_proposal;

        proposals?.proposals.sort((a: any, b: any) => {
          return (
            sortedProposalIds.indexOf(a.id) - sortedProposalIds.indexOf(b.id)
          );
        });
      }
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTask = async () => {
    await apiCall(
      requests.getTaskId + Number(id),
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setTask(res?.data?.data?.task || []);
      })
      .catch((err) => console.warn(err));
  };

  const onPageChange = (page: number) => {
    setPage(page);
    let filters = "";

    filters += page > 0 ? "?page=" + page : "";
    filters += limit > 0 ? "&limit=" + limit : "";
    filters += Number(id) > 0 ? "&taskId=" + Number(id) : "";

    setFilters(filters);
  };

  const onLimitChange = (limit: number) => {
    setLimit(limit);
  };

  const handlechange = (e: any) => {
    setStatus(e.target.value);
  };

  return (
    <div>
      <div className="card">
        <div className="card first-card card-header ">
          <div className="d-flex justify-content-between">
            <h3 className="mt-2">Proposals</h3>
            <div className="filtersearch d-flex align-items-center justify-content-between flex-wrap p-2">
              <div className="filters d-flex align-items-center ">
                <p
                  className="btn text-info btn-sm rounded-pill p-0"
                  onClick={getTopProposals}
                >
                  Get AI Recommendations
                </p>
                <select
                  className="form-select form-select-sm mx-1"
                  aria-label=".form-select-sm example"
                  onChange={handlechange}
                >
                  {Object.keys(ProposalStatus).map((key) => {
                    const value =
                      ProposalStatus[key as keyof typeof ProposalStatus];
                    return (
                      <option value={key} key={key}>
                        {value}
                      </option>
                    );
                  })}
                </select>
                <div className="searchBar">
                  <div
                    className="search-container"
                    style={{ width: "400px", maxWidth: "500px" }}
                  >
                    <input
                      type="text"
                      className="text-light"
                      id="search-bar"
                      placeholder="Search here"
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <Icon className="search-icon" icon="clarity:search-line" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-bodyy p-3">
            <div className="filtersearch d-lg-flex d-md-flex d-sm-flex align-items-center justify-content-between flex-wrap px-2">
              <div className="filtersearch filters d-flex flex-wrap align-items-center gap-3">
                <select className="form-select form-select-sm">
                  <option value="0">Rating</option>
                  <option value="2">3 stars</option>
                  <option value="4">4 stars</option>
                  <option value="4">5 stars</option>
                </select>
                <select className="form-select form-select-sm">
                  <option value="">Budget</option>
                  <option value="999">Less than $1000</option>
                  <option value="4999">Less than $5000</option>
                  <option value="9999">Less than $10000</option>
                  <option value="10000">10,000 or above</option>
                </select>
                <select className="form-select form-select-sm">
                  <option value="">Type</option>
                  <option value="FIXED">Fixed</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card-bodyy my-active-task">
          {/* {loading && <SkeletonLoader count={20} />} */}
          {!loadingg && proposals && proposals?.proposals?.length > 0 ? (
            proposals?.proposals.map((data: any, index: number) => (
              <div className="box m-2 " key={index}>
                <div className="row">
                  <div className=" col-lg-1 col-2 mx-3 ">
                    <div className=" card-profile text-center mt-4">
                      <ImageFallback
                        src={data?.expertProfile?.user?.profilePicture?.fileUrl}
                        fallbackSrc={defaultUserImg}
                        alt="img"
                        className=" user-img img-round"
                        width={60}
                        height={60}
                        priority
                        userName={
                          data?.expertProfile?.user?.firstName +
                          " " +
                          data?.expertProfile?.user?.lastName
                        }
                      />
                      <h2 className="w-s mt-1">
                        {data?.expertProfile?.user?.firstName}{" "}
                        {data?.expertProfile?.user?.lastName}
                      </h2>
                      <RatingStar rating={data?.expertProfile?.averageRating} />
                    </div>
                  </div>
                  <div className="col-lg-10 col-9 p-2 mb-2 ms-3">
                    <div className="priceanddate d-flex justify-content-between bordr ">
                      <div className="stars mb-3">
                        <h4>{data?.task?.name}</h4>
                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 
                                           ${
                                             data?.status === "HIRED"
                                               ? "text-bg-success"
                                               : data?.status === "SHORTLISTED"
                                               ? "text-bg-primary"
                                               : data?.status === "REJECTED"
                                               ? "text-bg-danger"
                                               : ""
                                           }`}
                        >
                          {data?.status}
                        </span>

                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 text-bg-primary `}
                        >
                          {data.teamId
                            ? "TEAM"
                            : data?.expertProfile?.user?.userType}
                        </span>
                      </div>
                      <div>
                        <span>{getTimeago(data.createdAt)}</span>
                        <h5>$ {data.amount}</h5>
                      </div>
                    </div>
                    <HtmlData
                      data={data?.details}
                      className="truncate-overflow text-white line-clamp-2 ps-2"
                    />
                    {/* <p>{data.details} </p> */}
                    <div className="card-footer d-flex justify-content-between  p-0 mb-3">
                      <div></div>
                    </div>
                    <div
                      className="btn-border"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Link
                        className="btn rounded-pill btn-outline-info btn-sm mx-1 my-1"
                        href={`/dashboard/tasks/${id}/proposals/${data?.id}`}
                        onClick={() =>
                          navigate(
                            `/dashboard/tasks/${id}/proposals/${data?.id}`
                          )
                        }
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : !loadingg ? (
            <NoFound message={"No Proposal Found"} />
          ) : null}
        </div>
        {/* {!loading && proposals && proposals?.count > 0 && <Pagination count={proposals?.count} page={page} limit={limit} onPageChange={onPageChange} onLimitChange={onLimitChange} siblingCount={1} />} */}
      </div>
    </div>
  );
};

export default Proposals;
