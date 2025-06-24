"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { requests } from "@/services/requests/requests";
import apiCall from "@/services/apiCall/apiCall";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import Hire from "@/components/common/Modals/Hire";
import SubmitReview from "@/components/common/Modals/SubmitReview";
import Contract from "@/components/common/Modals/Contract";
import { setThread } from "@/reducers/ThreadSlice";
import ConnectNotVerified from "@/components/common/Modals/ConnectNotVerified";

import ReportHours from "./ReportHours";
import { useNavigation } from "@/hooks/useNavigation";
import { toast } from "react-toastify";
import DeleteConfirmation from "@/components/common/Modals/DeleteConfirmation";
import RatingStar from "@/components/common/RatingStar/RatingStar";
import DisputeModal from "@/components/common/Modals/DisputeModal";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import { dynamicBlurDataUrl } from "@/services/utils/dynamicBlurImage";
import { getTimeago } from "@/services/utils/util";

const ViewTasks = () => {
  const [proposal, setProposal] = useState<any>({});
  const [contracts, setContracts] = useState<any>({});
  const [milestones, setMilestones] = useState<any>([]);
  const [dispute, setDispute] = useState<any>([]);
  const [hoursSubmit, setHoursSubmit] = useState<boolean>(false);
  const [details, setDetails] = useState<any>();
  const [hasMatchingThread, setHasMatchingThread] = useState<boolean>(false); // New state for thread existence
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { id } = useParams();
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [addReview, setAddReview] = useState<boolean>(false);
  const [areAllMilestonesApproved, setAreAllMilestonesApproved] = useState<boolean>(false);
  const [proposalCount, setPrposalCount] = useState<number>(0);
  const [stripeDetail, setStripeDetail] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState("");
  const [skip, setSkip] = useState<boolean>(true);
  const [team, setTeam] = useState<any>([]);
  const { navigate } = useNavigation();
  const time = getTimeago(details?.createdAt);

  const getMessageThread = async (proposal: any, navigate: boolean = false) => {
    try {
      const response = await apiCall(
        requests.getThread,
        {
          taskId: proposal?.taskId,
        },
        "get",
        false,
        dispatch,
        user,
        router
      );
      const matchingThread = response?.data?.threads?.find(
        (thread: any) => thread.expertProfileId === proposal.expertProfileId
      );

      console.log("check of thread", hasMatchingThread);
      if (matchingThread) {
        setHasMatchingThread(true); // Set state to true if thread exists
        dispatch(setThread(matchingThread));
        if (navigate) {
          router.push(`/dashboard/messages/${matchingThread?.id}`);
        }
      } else {
        setHasMatchingThread(false); // Set state to false if no thread exists
      }
    } catch (error) {
      console.warn("Error fetching threads", error);
      setHasMatchingThread(false);
    }
  };

  useEffect(() => {
    if (isAuth && proposal?.taskId) {
      getMessageThread(proposal); // Check for thread on proposal change
    }
  }, [isAuth, proposal]);

  const getConnectAccount = async () => {
    apiCall(
      `${requests?.connectStripeAccount}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res) => {
        if (res?.error?.message) return;
        setStripeDetail(
          res?.data?.data?.capabilities?.card_payments === "active"
        );
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    fetchBlurDataURL();
  }, [details?.requesterProfile?.user?.profilePicture]);

  const fetchBlurDataURL = async () => {
    if (details?.requesterProfile?.user?.profilePicture?.fileUrl) {
      const blurUrl = await dynamicBlurDataUrl(
        details?.requesterProfile?.user?.profilePicture.fileUrl
      );
      setProfileImageBlurDataURL(blurUrl);
    }
  };

  const getTeam = async (id: number) => {
    await apiCall(
      requests.teams,
      { id: id },
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        if (res?.data?.data?.teams?.length > 0) {
          setTeam({
            ...res?.data?.data?.teams[0],
            teamMembers: [
              ...res?.data?.data?.teams[0].teamMembers,
              {
                id: res?.data?.data?.teams[0]?.id,
                memberProfileId:
                  res?.data?.data?.teams[0]?.createdByProfile?.id,
                profile: res?.data?.data?.teams[0]?.createdByProfile,
              },
            ],
          });
        }
      })
      .catch((err) => console.warn(err));
  };

  const getTask = async (id: number) => {
    await apiCall(
      requests.getTaskId + id,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setDetails(res?.data?.data?.task || []);
        if (res?.data?.data?.task?.amountType === "HOURLY") {
          setMilestones(res?.data?.data?.task?.weeklyMilestones || []);
        }
      })
      .catch((err) => console.warn(err));
  };

  const getContract = async (id: number) => {
    console.log('tick 2')
    await apiCall(
      requests.getContract,
      { proposalId: Number(id) },
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
            console.log('tick 3')

        setContracts(res?.data?.data.contracts[0] || []);
                    console.log('tick 4')

        if (
          res?.data?.data.contracts[0]?.id &&
          details?.amountType !== "HOURLY"
        ) {
          setMilestones(res?.data?.data.contracts[0]?.milestones);
        }
      })
      .catch((err) => console.warn(err));
  };

  const getdisputes = async (id: number) => {
    const data = { taskId: id };
    try {
      const response = await apiCall(
        requests?.dispute,
        data,
        "get",
        false,
        dispatch,
        user,
        router
      );
      setDispute(response?.data?.data?.disputes || []);
    } catch (error) {
      console.warn("Error fetching disputes:", error);
    }
  };

  const closeContract = () => {
    // setShowModal(false);
    console.log('tick')
    getContract(Number(proposal?.id))
  }

  const getProposal = async (id: number) => {
    let params: any = "?taskId=" + id;
    params += "&limit=" + 1;
    params += "&page= " + 1;
    await apiCall(
      `${requests.getProposals}${params}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setProposal(res?.data?.data?.proposals[0] || {});
        setPrposalCount(res?.data?.data?.count || 0);
      })
      .catch((err) => console.warn(err));
  };

  // const getMilestones = async (id: number) => {
  //   let params: any = "?contractId=" + Number(id);
  //   const data = { taskId: Number(details?.id) };
  //   await apiCall(
  //     `${requests.getMilestones}${params}`,
  //     data,
  //     "get",
  //     false,
  //     dispatch,
  //     user,
  //     router
  //   )
  //     .then((res: any) => {
  //       setMilestones(res?.data?.data?.milestones);
  //     })
  //     .catch((err) => console.warn(err));
  // };

  const onDelete = async (id: number) => {
    apiCall(requests.editTask + id, "", "delete", false, dispatch, user, router)
      .then((res: any) => {
        let message: any;
        if (res?.error) {
          message = res?.error?.message;
          if (Array.isArray(message)) {
            message?.map((msg: string) =>
              toast.error(msg ? msg : "Something went wrong, please try again")
            );
          } else {
            toast.error(
              message ? message : "Something went wrong, please try again"
            );
          }
        } else {
          router.push("/dashboard/tasks");
        }
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    if (isAuth) {
      getProposal(Number(id));
      getConnectAccount();
    }
  }, [isAuth, id]);

  useEffect(() => {
    if (isAuth && proposal?.id) getContract(Number(proposal?.id));
    if (isAuth && proposal?.teamId) getTeam(proposal?.teamId);
  }, [proposal, isAuth]);

  // useEffect(() => {
  //   if (isAuth && contracts?.id && details?.amountType !== "HOURLY") {
  //     getMilestones(Number(contracts?.id));
  //   }
  // }, [contracts]);

  useEffect(() => {
    getTask(Number(id));
    if (isAuth) getdisputes(Number(id));
  }, [id, hoursSubmit]);

  useEffect(() => {
    if (milestones?.length > 0) {
      setAddReview(
        milestones?.some((milestone: any) => milestone.status === "FUNDED") &&
        details?.reviews?.length !== 2
      );

      setAreAllMilestonesApproved(
        milestones?.every(
          (milestone: any) =>
            milestone.status === "APPROVED" ||
            milestone.status === "PAID" ||
            milestone.status === "FUNDED"
        ) || false
      );
    }
  }, [milestones]);

  const formatedDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div>
      <div className="card">
        <div className="viewtask-card card-header px-4 bg-gray">
          <div className="card-left-heading">
            <h3>View Task Details</h3>
          </div>
        </div>
        <div className="card-bodyy viewtask">
          <div className="box m-2 p-3">
            <div className="box m-2 bg-black key INDUSTRY p-3">
              <div className="mt-2 mx-3">
                {details?.promoted && (
                  <div className="ribbon-1 mb-3">
                    <Image
                      src={"/assets/images/promote.svg"}
                      alt="img"
                      className="img-fluid ribbon-img"
                      width={120}
                      height={130}
                      priority
                    />
                  </div>
                )}
                <div className="row mx-3 ">
                  <div className="col-auto ms-0 ps-0">
                    <Link
                      className="text-lg-end card-profile  mt-4 "
                      href={`/dashboard/talent-requestors/${details?.requesterProfile?.userId}`}
                      onClick={() =>
                        navigate(
                          `/dashboard/talent-requestors/${details?.requesterProfile?.userId}`
                        )
                      }
                    >
                      <div className="inerprofile text-center">
                        <ImageFallback
                          src={
                            details?.requesterProfile?.user?.profilePicture
                              ?.fileUrl
                          }
                          alt="img"
                          className="img-round"
                          width={60}
                          height={60}
                          loading="lazy"
                          blurDataURL={profileImageBlurDataURL}
                          userName={
                            details?.requesterProfile?.user
                              ? `${details?.requesterProfile?.user?.firstName} ${details?.requesterProfile?.user?.lastName}`
                              : null
                          }
                        />
                        <h2 className="ms-1 mt-2">
                          {details?.requesterProfile?.user?.firstName}{" "}
                          {details?.requesterProfile?.user?.lastName}
                        </h2>
                        <RatingStar
                          rating={
                            details?.requesterProfile?.averageRating
                              ? details?.requesterProfile?.averageRating
                              : 0
                          }
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="col">
                    <div className="priceanddate  justify-content-between bordr ">
                      <div className="d-flex flex-wrap align-items-baseline">
                        <div className="priceanddate d-flex justify-content-between ">
                          <div className="d-flex align-items-baseline">
                            <div className="stars mb-2">
                              <h3 className="me-3 ms-lg-0 text-light">
                                {details?.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 
                                           ${
                                             details?.status === "INPROGRESS"
                                               ? "text-bg-warning"
                                               : details?.status === "COMPLETED"
                                               ? "text-bg-success"
                                               : details?.status === "POSTED"
                                               ? "text-bg-primary"
                                               : details?.status === "CLOSED"
                                               ? "text-bg-danger"
                                               : ""
                                           }`}
                        >
                          {details?.status}
                        </span>
                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 
                                           ${
                                             details?.taskType === "ONLINE"
                                               ? "text-bg-success"
                                               : details?.status === "POSTED"
                                               ? "text-bg-primary"
                                               : ""
                                           }`}
                        >
                          {details?.taskType}
                        </span>
                      </div>
                      <div className="pricedate">
                        <span className="d-flex justify-content-center">
                          {time}
                        </span>
                        {details?.amountType === "HOURLY" ? (
                          <h5 className="d-flex justify-content-center">
                            $ {details?.amount} / hr
                          </h5>
                        ) : (
                          <h5 className="d-flex justify-content-center">
                            $ {details?.amount}
                          </h5>
                        )}
                        <span className="text-white text-nowrap d-flex flex-column">
                          <span>
                            {`Posting Date: ${formatedDate(
                              details?.startDate
                            )}`}
                          </span>
                          <span style={{ margin: "0 10px" }}></span>
                          <span>
                            {`Ending Date: ${formatedDate(details?.endDate)}`}
                          </span>
                        </span>{" "}
                        {/* <h6 className='text-white d-flex justify-content-center'></h6> */}
                      </div>
                    </div>
                    <div className="">
                      <div className="card-footer d-flex flex-wrap justify-content-between pb-4">
                        <div className="d-flex  justify-content-between category-btns">
                          {details?.categories?.length > 0 &&
                          details?.categories[0]?.category?.parentCategory ? (
                            <button
                              className="btn btn-black btn-sm rounded-pill ls mt-2 mx-1 w-s"
                              style={{ pointerEvents: "none" }}
                            >
                              {details?.categories?.length > 0 &&
                                details?.categories[0]?.category?.parentCategory
                                  ?.name}
                            </button>
                          ) : (
                            ""
                          )}
                          {details?.categories?.map((cat: any, id: number) => (
                            <div key={id}>
                              <button
                                className="btn btn-dark btn-sm rounded-pill ls mt-2 mx-1 w-s"
                                style={{ pointerEvents: "none" }}
                              >
                                {cat?.category?.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <HtmlData
                data={details?.details}
                className="text-white mt-4 mx-4"
              />
              <div className="bordr"></div>
              {isAuth && details?.documents?.length > 0 && (
                <h5 className="text-white mt-2">Documents</h5>
              )}
              {isAuth &&
                details?.documents?.map((doc: any) => (
                  // onClick={() => getPrivateFile(doc)}
                  <div key={doc.fileUrl}>
                    <Link
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.key}
                    </Link>
                  </div>
                ))}
              <div className="viewtaskquestion">
                {details?.interviewQuestions?.length > 0 && (
                  <h6>Interview Questions</h6>
                )}
                {details?.interviewQuestions?.map(
                  (data: any, index: number) => (
                    <ul key={index}>
                      <li>{data.question}</li>
                    </ul>
                  )
                )}
              </div>
              {!isAuth && (
                <div className="btn-border mt-4">
                  <Link
                    className="btn rounded-pill btn-outline-info mx-1 my-1"
                    href="/signin"
                    onClick={() => navigate("/signin")}
                  >
                    Submit Proposal
                  </Link>
                </div>
              )}
              {isAuth && (
                <>
                  {details?.amountType === "HOURLY" &&
                    details?.weeklyMilestones?.length > 0 &&
                    details?.weeklyMilestones[0]?.status == "FUNDED" &&
                    user?.profile[0].type === "TE" && (
                      <ReportHours
                        task={details}
                        hoursSubmit={hoursSubmit}
                        setHoursSubmit={setHoursSubmit}
                        proposalAmount={proposal?.amount}
                      />
                    )}
                  {details?.status !== "CLOSED" && (
                    <div
                      className="btn-border mt-4 "
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      {user?.profile?.length > 0 &&
                      user?.profile[0]?.type === "TR" ? (
                        <>
                          {/* <Link
                                                        className={`btn rounded-pill btn-outline-info mx-1 my-1 ${details?.status !== 'POSTED' && 'disabled'}`}
                                                        href={`/dashboard/tasks/${id}/edit`}
                                                        onClick={() => navigate(`/dashboard/tasks/${id}/edit`)}
                                                    >
                                                        Edit
                                                    </Link> */}
                          <Link
                            className="btn rounded-pill btn-outline-info mx-1 my-1"
                            href={`/dashboard/tasks/${id}/proposals`}
                            onClick={() =>
                              navigate(`/dashboard/tasks/${id}/proposals`)
                            }
                          >
                            Proposals ({proposalCount})
                          </Link>
                          {/* {details?.status !== 'INPROGRESS' && details?.status !== 'COMPLETED' && (
                                                        <button className='btn rounded-pill btn-outline-danger mx-1 my-1' data-bs-target="#exampleModalToggle24" data-bs-toggle="modal">
                                                            Delete
                                                        </button>
                                                    )} */}
                        </>
                      ) : (
                        <>
                          {proposal?.id ? (
                            <>
                              <Link
                                className="btn rounded-pill btn-outline-info mx-1 my-1"
                                href={`/dashboard/tasks/${id}/proposals/${proposal.id}`}
                                onClick={() =>
                                  navigate(
                                    `/dashboard/tasks/${id}/proposals/${proposal.id}`
                                  )
                                }
                              >
                                View Proposal
                              </Link>
                              {contracts?.id && (
                                <>
                                  <button
                                    className="btn rounded-pill btn-outline-info mx-1 my-1"
                                    onClick={() => setShowModal(true)}
                                  >
                                    View Contract{" "}
                                    {contracts?.id && contracts?.isTEApproved
                                      ? "✔✔"
                                      : "✔"}
                                  </button>
                                </>
                              )}
                              {milestones?.length > 0 && milestones[0]?.id && (
                                <button
                                  className="btn rounded-pill btn-outline-info mx-1 my-1"
                                  data-bs-target="#exampleHiredProposal"
                                  data-bs-toggle="modal"
                                >
                                  Milestone{" "}
                                  {areAllMilestonesApproved ? "✔" : ""}{" "}
                                  {milestones?.length > 0 &&
                                  milestones[0]?.amount !== ""
                                    ? "✔"
                                    : ""}
                                </button>
                              )}
                              {addReview && details?.reviews?.length > 0
                                ? details?.reviews?.map((review: any) =>
                                    addReview &&
                                    review?.reviewerProfileId ===
                                      user?.profile[0]?.id ? (
                                      ""
                                    ) : (
                                      <button
                                        key={review?.id}
                                        className="btn rounded-pill btn-outline-info mx-1 my-1"
                                        data-bs-target="#exampleModalToggle88"
                                        data-bs-toggle="modal"
                                        disabled={
                                          review?.reviewerProfileId ===
                                          user?.profile[0]?.id
                                        }
                                      >
                                        {review?.reviewerProfileId ===
                                        user?.profile[0]?.id
                                          ? "Review Submitted"
                                          : "Submit Review"}
                                      </button>
                                    )
                                  )
                                : addReview && (
                                    <button
                                      className="btn rounded-pill btn-outline-info mx-1 my-1"
                                      data-bs-target="#exampleModalToggle88"
                                      data-bs-toggle="modal"
                                    >
                                      Submit Review
                                    </button>
                                  )}

                              {hasMatchingThread &&
                                (contracts?.id ||
                                  details?.status === "COMPLETED") && (
                                  <button
                                    className="btn rounded-pill btn-outline-info mx-1 my-1"
                                    onClick={() =>
                                      getMessageThread(proposal, true)
                                    }
                                  >
                                    Message
                                  </button>
                                )}
                            </>
                          ) : (
                            <div className="d-flex justify-content-end">
                              <Link
                                className="btn rounded-pill btn-outline-info "
                                href={`/dashboard/tasks/${id}/add-proposal`}
                                onClick={() =>
                                  stripeDetail
                                    ? navigate(
                                        `/dashboard/tasks/${id}/add-proposal`
                                      )
                                    : "#"
                                }
                              >
                                Submit Proposal
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                      {proposal?.id &&
                        (details?.status === "INPROGRESS" ||
                          details?.status === "COMPLETED") &&
                        (dispute?.length > 0 ? (
                          <button
                            className="btn rounded-pill btn-outline-info mx-1 w-s my-1"
                            data-bs-target="#exampleModalToggle11"
                            data-bs-toggle="modal"
                          >
                            Dispute
                          </button>
                        ) : (
                          <button
                            className="btn rounded-pill btn-outline-info mx-1 my-1"
                            data-bs-target="#exampleModalToggle11"
                            data-bs-toggle="modal"
                          >
                            Add Dispute
                          </button>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
            {details?.reviews?.length > 0 &&
              details?.reviews?.map(
                (review: any) =>
                  isAuth && (
                    <div
                      className="review mx-2 p-3 mt-3"
                      key={review?.reviewerProfileId}
                    >
                      <div className="d-flex">
                        <Link
                          href={`/dashboard/talented-xperts/${review?.reviewerProfile?.userId}`}
                          onClick={() =>
                            navigate(
                              `/dashboard/talented-xperts/${review?.reviewerProfile?.userId}`
                            )
                          }
                        >
                          <ImageFallback
                            src={
                              review?.reviewerProfile?.user?.profilePicture
                                ?.fileUrl
                            }
                            alt="img"
                            className="user-img img-round me-3"
                            width={40}
                            height={40}
                            priority
                            userName={
                              review?.reviewerProfile?.user
                                ? `${review?.reviewerProfile?.user?.firstName} ${review?.reviewerProfile?.user?.lastName}`
                                : null
                            }
                          />
                        </Link>
                        <div className="text-light d-flex justify-content-between">
                          <div>
                            <h6>
                              {review?.reviewerProfile?.user?.firstName}{" "}
                              {review?.reviewerProfile?.user?.lastName}
                            </h6>
                            <RatingStar rating={review?.rating} />
                            <span>{review?.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
          </div>
        </div>
        {isAuth && (
          <>
            <Hire
              milestone={milestones}
              setMilestones={setMilestones}
              amount={proposal?.amount}
              contract={contracts}
              type={true}
              task={details}
              team={team}
            />
            <SubmitReview
              taskId={id}
              revieweeId={Number(details?.requesterProfileId)}
            />
            {showModal && (
              <Contract
                taskId={Number(id)}
                proposalId={proposal?.id}
                taskStatus={details?.status}
                isOpen={showModal}
                onClose={closeContract}
                getContractTask={getContract}
              />
            )}

            <DeleteConfirmation
              onClickFunction={onDelete}
              type={"task"}
              id={details?.id}
            />
            {(details?.status === "INPROGRESS" ||
              details?.status === "COMPLETED") && (
              <DisputeModal
                type={false}
                taskId={Number(id)}
                proposalId={proposal?.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewTasks;
