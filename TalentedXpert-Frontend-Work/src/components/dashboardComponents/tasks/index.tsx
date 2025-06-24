"use client";
import React, { FC, useEffect, useState } from "react";
import TopMenu from "./TopMenu";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import FilterCard from "./FilterCard";
import { Pagination } from "@/components/common/Pagination/Pagination";
import TaskCard from "./TaskCard";
import NoFound from "@/components/common/NoFound/NoFound";
import { skip } from "node:test";

const Tasks: FC<any> = ({ isactive, topMenu, auth }) => {
  const [tasks, setTasks] = useState<any>([]);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [promoted, setPromoted] = useState<boolean>(
    user?.profile[0]?.type == "TE" && status !== "" ? true : false
  );
  const [disability, setDisability] = useState<boolean>(false);
  console.log("type", user?.profile[0]?.type == "TE" ? true : false);
  const [amountType, setAmountType] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (
      status === "PROPOSALS" ||
      (user?.profile?.length > 0 &&
        user?.profile[0]?.type === "TE" &&
        status === "CLOSED")
    ) {
      getProposal(filters);
    } else {
      if (filters && filters != "") {
        getAllTasks(filters);
      }
    }
  }, [user, filters]);

  const setFilterParams = () => {
    let filters = "";
    filters += "?page=" + page || "";
    filters += limit > 0 ? "&limit=" + limit : "";
    if (isactive) {
      filters += "&status=INPROGRESS";
      filters +=
        "&profileType=" +
        `${user?.profile?.length > 0 && user?.profile[0]?.type}`;
    } else {
      filters += status != "" ? "&status=" + status : "";
      if (
        status === "INPROGRESS" ||
        status === "COMPLETED" ||
        status === "CLOSED"
      ) {
        filters +=
          "&profileType=" +
          `${user?.profile?.length > 0 && user?.profile[0]?.type}`;
      }
      filters += rating ? "&rating=" + rating : "";
      filters += minBudget ? "&minBudget=" + minBudget : "";
      filters += maxBudget ? "&maxBudget=" + maxBudget : "";
      promoted ? (filters += "&promoted=" + promoted) : "";
      disability ? (filters += "&disability=" + disability) : "";
      filters += amountType != "" ? "&amountType=" + amountType : "";
      filters += search != "" ? "&name=" + search : "";
    }

    setFilters(filters);
  };

  const getProposal = async (params: any) => {
    setLoading(true);

    let param = params
    .replace(/&promoted=[^&]*/g, "")
    .replace(/&status=[^&]*/g, "")
    .replace(/&profileType=[^&]*/g, "");

  let statusParam = "";

  if (
    user?.profile?.length > 0 &&
    user?.profile[0]?.type === "TE" &&
    status === "CLOSED"
  ) {
    statusParam = "&status=CLOSED";
  } else if (status === "PROPOSALS") {
    statusParam = "&status=SUBMITTED";
  }

  // Add new status param
  param += statusParam;
    await apiCall(
      `${requests.getProposals}${param}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setTasks(res?.data?.data || []);
        setLoading(false);
        // setProposal(res?.data?.data?.proposals[0] || [])
        // setPrposalCount(res?.data?.data?.count || 0)
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    setFilterParams();
  }, [
    limit,
    status,
    promoted,
    amountType,
    rating,
    minBudget,
    maxBudget,
    search,
    page,
    user,
    disability,
  ]);

  useEffect(() => {
    setDisability(false);
    setAmountType("");
    setMinBudget("");
    setMaxBudget("");
    setRating("");
    setPromoted(user?.profile[0]?.type === "TE" && status == "");
    setPage(1);
  }, [status]);

  const getAllTasks = async (params: any) => {
    try {
      setLoading(true);
      const response = await apiCall(
        isactive ||
          status === "INPROGRESS" ||
          status === "COMPLETED" ||
          status === "CLOSED"
          ? `${requests.getTaskOnStatus}${user?.id}${params}`
          : `${requests.getTasks}${params}`,
        {},
        "get",
        false,
        dispatch,
        user,
        router,
        !auth || ( isactive || status === 'INPROGRESS' || status === 'COMPLETED' || status === 'CLOSED')
        ? false : true
      );

      setTasks(response?.data?.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (page: number) => {
    setPage(page);
    let filters = "";

    filters += page > 0 ? "?page=" + page : "";
    filters += limit > 0 ? "&limit=" + limit : "";

    setFilters(filters);
  };

  const onLimitChange = (limit: number) => {
    setLimit(limit);
  };

  return (
    <div className={`card h-100 ${!isactive && !topMenu && "forpadding"}`}>
      {(isactive || (!isactive && !topMenu)) && (
        <div className="bg-dark text-white card-header d-flex justify-content-between px-4 ">
          <div className="card-left-heading">
            <h3>
              {!isactive ? "Tasks" : `My Working Tasks (${tasks?.count || 0})`}
            </h3>
          </div>
        </div>
      )}
      <div className="tab-card first-card card-header card-bodyy h-100 ">
        {!isactive && topMenu && <TopMenu setStatus={setStatus} />}
        {!isactive && (
          <FilterCard
            promoted={promoted}
            setRating={setRating}
            disability={disability}
            setDisability={setDisability}
            rating={rating}
            setPromoted={setPromoted}
            minBudget={minBudget}
            maxBudget={maxBudget}
            setMinBudget={setMinBudget}
            setMaxBudget={setMaxBudget}
            setAmountType={setAmountType}
            resetFilters={status}
            setSearch={setSearch}
            amountType={amountType}
          />
        )}

        <div className="tab-content" id="pills-tabContent">
          {status == "PROPOSALS" ||
          (user?.profile?.length > 0 &&
            user?.profile[0]?.type === "TE" &&
            status === "CLOSED") ? (
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-home-tab"
              tabIndex={0}
            >
              {/* {loading && <SkeletonLoader count={20} />} */}
              {!loading &&
              tasks &&
              tasks?.count > 0 &&
              tasks?.proposals?.length > 0 ? (
                tasks.proposals?.map((task: any) => (
                  <TaskCard
                    key={task?.task?.id}
                    task={task?.task}
                    reviews={task?.requesterProfile?.averageRating}
                    status={status}
                  />
                ))
              ) : !loading ? (
                <NoFound message={"No Task Found"} />
              ) : null}
            </div>
          ) : (
            <div
              className="tab-pane fade show active"
              id="pills-home"
              role="tabpanel"
              aria-labelledby="pills-home-tab"
              tabIndex={0}
            >
              {/* {loading && <SkeletonLoader count={20} />} */}
              {!loading && tasks && tasks?.tasks?.length > 0 ? (
                tasks?.tasks?.map((task: any) => (
                  <TaskCard
                    key={task?.id}
                    task={task}
                    reviews={task?.requesterProfile?.averageRating}
                  />
                ))
              ) : // tasks?.tasks?.map((task: any) => <TaskCard key={task?.id} task={task} reviews={task?.reviews?.length > 0 ? task?.reviews?.filter((rev: any) => rev?.revieweeProfileId === (user?.profile?.length > 0 && user?.profile[0]?.id)) : 0} />)

              !loading ? (
                <NoFound message={"No Task Found"} />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* pagination */}
      {!loading && tasks && tasks?.count > 0 && (
        <Pagination
          count={tasks?.count}
          page={page}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          siblingCount={1}
        />
      )}
    </div>
  );
};

export default Tasks;
