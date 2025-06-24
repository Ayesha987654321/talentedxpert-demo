"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { getTimeago } from "@/services/utils/util";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import { dynamicBlurDataUrl } from "@/services/utils/dynamicBlurImage";
import { setThread } from "@/reducers/ThreadSlice";
import Link from "next/link";
import Hire from "@/components/common/Modals/Hire";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import DisputeModal from "@/components/common/Modals/DisputeModal";
import RejectProposal from "@/components/common/Modals/RejectProposal";
import SubmitReview from "@/components/common/Modals/SubmitReview";
import Contract from "@/components/common/Modals/Contract";
import MemberList from "../teams/ViewTeam/MemberList";
import RatingStar from "@/components/common/RatingStar/RatingStar";
import { useNavigation } from "@/hooks/useNavigation";
import GlobalLoader from "@/components/common/GlobalLoader/GlobalLoader";
import HoursHistory from "../viewTasks/HoursHistory";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

const ViewProposal = () => {
  let { id, proposalId } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [proposal, setProposal] = useState<any>({});
  const [articles, setArticles] = useState<any>([]);
  const [contracts, setContracts] = useState<any>({});
  const [task, setTask] = useState<any>({});
  const [dispute, setDispute] = useState<any>([{}]);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<string>("");
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState("");
  const [type, setType] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>({});
  const [count, setCount] = useState<number>(0);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [showJobDetails, setShowJobDetails] = useState<boolean>(false);
  const [areAllMilestonesApproved, setAreAllMilestonesApproved] =
    useState<boolean>(false);
  const [areAllMilestonesPaid, setAreAllMilestonesPaid] =
    useState<boolean>(false);
  const [addReview, setAddReview] = useState<boolean>(false);
  const [proposalCount, setPrposalCount] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showHireConfirmModal, setShowHireConfirmModal] =
    useState<boolean>(false);
  const [hours, setHours] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const revieweeId =
    user?.profile[0].type == "TR"
      ? Number(proposal?.expertProfileId)
      : Number(task?.requesterProfileId);
  const [team, setTeam] = useState<any>([]);
  const { navigate } = useNavigation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Toggle function for accordion items
  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getProposals = async () => {
    try {
      const response = await apiCall(
        requests.getProposals,
        { id: Number(proposalId) },
        "get",
        false,
        dispatch,
        user,
        router
      );
      setProposal(response?.data?.data?.proposals[0] || {});
      setArticles(response.data?.data?.proposals[0].articles || []);
    } catch (error) {
      console.warn("Error fetching tasks:", error);
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

  const getWallet = async () => {
    await apiCall(
      `${requests.wallet}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        if (res?.error) {
          return;
        } else {
          setWallet(res?.data?.data);
          console.log("wallet", res?.data?.data || []);
        }
      })
      .catch((err) => console.warn(err));
  };

  const updateProposals = async (
    status: string,
    reason: string,
    hours?: number
  ) => {
    const data = {
      status: status,
      taskId: Number(id),
      ...(status === "REJECTED" && { rejectionReason: reason }),
      ...(status === "HIRED" &&
        task?.amountType === "HOURLY" &&
        hours && { maxHours: hours, maxAmount: totalAmount }),
    };
    try {
      const response = await apiCall(
        requests.updateProposal + Number(proposalId),
        data,
        "put",
        false,
        dispatch,
        user,
        router
      );
      console.log("eefd", response);
      if (status === "HIRED") {
        toast.success(
          "Your task is in progress. Now you need to fund the milestone."
        );
      }
      status !== "HIRED"
        ? router.push(`/dashboard/tasks/${id}/proposals`)
        : getProposals();
      getTask();
    } catch (error) {
      console.warn(error);
    }
  };

  const updateTask = async (status: string) => {
    const data = {
      status: status,
    };
    try {
      const response = await apiCall(
        requests.editTask + Number(id),
        data,
        "put",
        false,
        dispatch,
        user,
        router
      );
      if (status === "COMPLETED") {
        router.push(`/dashboard/tasks`);
        if (
          task?.reviewtask?.reviews?.length > 0 &&
          task?.reviews?.map(
            (review: any) => review?.reviewerProfileId === user?.profile[0]?.id
          )
        ) {
          toast.success("Your Task is completed");
        } else toast.success("Your Task is completed Kindly submit a review");
      }
    } catch (error) {
      console.warn(error);
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
        setPrposalCount(res?.data?.data?.task?.proposals?.length || 0);
        if (res?.data?.data?.task?.amountType === "HOURLY") {
          setMilestones(res?.data?.data?.task?.weeklyMilestones || []);
          console.log("weekly", res?.data?.data?.task?.weeklyMilestones);
          setFilterParams();
        }
      })
      .catch((err) => console.warn(err));
  };

  const getContract = async () => {
    await apiCall(
      requests.getContract,
      { proposalId: Number(proposalId) },
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setContracts(res?.data?.data?.contracts[0] || []);
        console.log(
          "check mile",
          res?.data?.data?.contracts[0]?.milestones.length,
          task
        );

        if (
          res?.data?.data?.contracts[0]?.milestones.length > 0 &&
          task?.amountType === "FIXED"
        ) {
          console.log("check whyy");
          setMilestones(res?.data?.data?.contracts[0]?.milestones || []);
          setCount(res?.data?.data?.contracts[0]?.milestones.length || []);
          setType(true);
        }
      })
      .catch((err) => console.warn(err));
  };

  // const getMilestones = async (filters: any) => {
  //   await apiCall(
  //     `${requests.getMilestones}${filters}`,
  //     {},
  //     "get",
  //     false,
  //     dispatch,
  //     user,
  //     router
  //   )
  //     .then((res: any) => {
  //       if (res?.data?.data?.milestones) {
  //         setMilestones(res?.data?.data?.milestones || []);
  //         setCount(res?.data?.data?.count || []);
  //         setType(true);
  //       }
  //     })
  //     .catch((err) => console.warn(err));
  // };

  const getdisputes = async (id: number) => {
    const data = {
      taskId: id,
    };
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
      setDispute(response?.data?.data?.disputes || {});
    } catch (error) {
      console.warn("Error fetching tasks:", error);
    }
  };

  const getMessageThread = async (proposal: any) => {
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
      if (matchingThread) {
        dispatch(setThread(matchingThread));
        router.push(`/dashboard/messages/${matchingThread?.id}`);
      } else {
        let data = {
          taskId: proposal?.taskId,
          expertProfileId: proposal?.expertProfileId,
          threadType: "TASK",
        };

        let teamData = {
          teamId: proposal.teamId,
          threadType: "TEAM",
        };
        const res = await apiCall(
          requests.createThread,
          proposal.teamId ? teamData : data,
          "post",
          false,
          dispatch,
          user,
          router
        );
        dispatch(setThread(res?.data.thread));
        router.push(`/dashboard/messages/${res?.data.thread?.id}`);
      }
    } catch (error) {
      console.warn("Error fetching threads", error);
    }
  };

  useEffect(() => {
    getTask();
    getdisputes(Number(id));
  }, [id]);

  useEffect(() => {
    if (proposalId) {
      getContract();
      getWallet();
      getProposals();
    }
  }, [proposalId, task.id]);

  useEffect(() => {
    if (contracts?.id) {
      setFilterParams();
    }
  }, [limit, page, contracts, task]);

  // useEffect(() => {
  //   if (filters && filters != "") {
  //     if (task?.id) {
  //       getMilestones(filters);
  //     }
  //   }
  // }, [filters, task]);

  useEffect(() => {
    if (proposal?.teamId) {
      getTeam(proposal?.teamId);
    }
  }, [proposal]);

  const setFilterParams = () => {
    let filters = "";
    filters += "?page=" + 1 || "";
    filters += limit > 0 ? "&limit=" + limit : "";
    filters += task?.id ? "&taskId=" + task?.id : "";
    filters += contracts?.id ? "&contractId=" + contracts?.id : "";

    setPage(1);
    setFilters(filters);
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

  useEffect(() => {
    if (milestones?.length > 0) {
      setAreAllMilestonesApproved(
        milestones?.every(
          (milestone: any) =>
            milestone.status === "APPROVED" ||
            milestone.status === "PAID" ||
            milestone.status === "FUNDED"
        ) || false
      );
      setAreAllMilestonesPaid(
        milestones?.every((milestone: any) => milestone.status === "PAID") ||
          false
      );
      setAddReview(
        milestones?.some((milestone: any) => milestone.status === "FUNDED") &&
        task?.reviews?.length !== 2
      );
    }
  }, [milestones]);

  console.log(
    "rr check",
    milestones?.some((milestone: any) => milestone.status === "PAID") &&
      task?.reviews?.length !== 2
  );
  useEffect(() => {
    if (user?.profilePicture?.fileUrl || defaultUserImg) {
      fetchBlurDataURL();
    }
  }, [user?.profilePicture, defaultUserImg]);

  const fetchBlurDataURL = async () => {
    if (user?.profilePicture?.fileUrl || defaultUserImg) {
      const blurUrl = await dynamicBlurDataUrl(
        user?.profilePicture?.fileUrl || defaultUserImg
      );
      setProfileImageBlurDataURL(blurUrl);
    }
  };

  const closeContract = () => {
    getContract();
    setShowModal(false);
  };

  const toggleJobDetails = () => {
    setShowJobDetails(!showJobDetails);
  };

  const handleHireClick = () => {
    setShowHireConfirmModal(true);
    setHours(0);
    setTotalAmount(0);
  };

  const handleConfirmHire = () => {
    setShowHireConfirmModal(false);
    if (task?.amountType === "HOURLY") {
      updateProposals("HIRED", "", hours);
    } else {
      updateProposals("HIRED", "");
    }
  };

  const handleCancelHire = () => {
    setShowHireConfirmModal(false);
    setHours(0);
    setTotalAmount(0);
  };

  return (
    <div className="card">
      <div
        className="card first-card card-header d-flex justify-content-between align-items-center"
        style={{ flexDirection: "row-reverse" }}
      >
        <button
          className="btn btn-outline-info rounded-pill"
          onClick={toggleJobDetails}
        >
          {showJobDetails ? "Hide Task Details" : "Show Task Details"}
        </button>
        <h3 className="m-0">View TalentedXpert Proposal</h3>
      </div>
      <div className="card-bodyy my-active-task bg-black">
        <div className="row">
          <div
            className={`col-md-${
              showJobDetails ? "6" : "12"
            } transition-all duration-300`}
          >
            <div className="box my-2 px-3">
              <div className="row">
                <div className="col-3">
                  <div className="card-profile text-center mt-4">
                    <Link
                      href={`/dashboard/talented-xperts/${proposal?.expertProfile?.userId}`}
                      onClick={() =>
                        navigate(
                          `/dashboard/talented-xperts/${proposal?.expertProfile?.userId}`
                        )
                      }
                    >
                      <ImageFallback
                        src={
                          proposal?.expertProfile?.user?.profilePicture?.fileUrl
                        }
                        fallbackSrc={defaultUserImg}
                        alt="img"
                        className="user-img img-round"
                        width={60}
                        height={60}
                        loading="lazy"
                        blurDataURL={profileImageBlurDataURL}
                        userName={
                          proposal?.expertProfile?.user
                            ? `${proposal?.expertProfile?.user?.firstName} ${proposal?.expertProfile?.user?.lastName}`
                            : null
                        }
                      />
                      <h2 className="w-s mt-1">
                        {proposal?.expertProfile?.user?.firstName}{" "}
                        {proposal?.expertProfile?.user?.lastName}
                      </h2>
                      <RatingStar
                        rating={proposal?.expertProfile?.averageRating}
                      />
                    </Link>
                  </div>
                </div>
                <div className="col-9">
                  <div className="priceanddate d-flex justify-content-between bordr">
                    <div className="stars mb-2">
                      <h4 className="m-0 p-0">{proposal?.task?.name}</h4>
                    </div>
                    <span
                      className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 text-bg-primary`}
                    >
                      {proposal.teamId
                        ? "TEAM"
                        : proposal?.expertProfile?.user?.userType}
                    </span>
                    <div>
                      {task?.amountType === "HOURLY" ? (
                        <h5 className="text-center">
                          $ {proposal?.amount} / hr
                        </h5>
                      ) : (
                        <h5 className="text-center">$ {proposal?.amount}</h5>
                      )}
                    </div>
                  </div>
                  <HtmlData data={proposal?.details} className="text-white" />
                  {proposal?.rejectionReason &&
                    user?.profile?.length > 0 &&
                    user?.profile[0]?.type === "TE" && (
                      <div className="alert alert-danger mt-4">
                        <h5 className="mb-2 text-danger">Rejection Reason</h5>
                        <p className="mb-0">{proposal.rejectionReason}</p>
                      </div>
                    )}
                  {proposal?.documents?.map((doc: any) => (
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
                  <div className="accordion" id="accordionExamplee12">
                    {proposal?.answers?.map((data: any, index: number) => (
                      <div className="accordion-item" key={index}>
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${
                              openIndex === index ? "" : "collapsed"
                            } bg-black text-white`}
                            type="button"
                            onClick={() => toggleAccordion(index)}
                            aria-expanded={openIndex === index}
                            aria-controls={`collapsee${index}`}
                          >
                            {data?.question?.question}
                          </button>
                        </h2>
                        <div
                          id={`collapsee${index}`}
                          className={`accordion-collapse collapse ${
                            openIndex === index ? "show" : ""
                          }`}
                          data-bs-parent="#accordionExamplee12"
                        >
                          <div className="accordion-body bg-gray text-white border-bottom">
                            {data.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {proposal?.teamId && (
                    <h5 className="mb-3">Team Information</h5>
                  )}
                  {proposal?.teamId && (
                    <MemberList data={team?.teamMembers} type="members" />
                  )}
                  {task?.status !== "CLOSED" && (
                    <div
                      className="btn-border mt-4"
                      style={{ justifyContent: "flex-end" }}
                    >
                      {user?.profile[0]?.type === "TR" ? (
                        <>
                          {proposal?.status !== "SHORTLISTED" && (
                            <button
                              className={`btn rounded-pill btn-outline-info mx-1 my-1 ${
                                contracts?.isTEApproved ? "disabled" : ""
                              }`}
                              onClick={() => updateProposals("SHORTLISTED", "")}
                            >
                              Shortlist
                            </button>
                          )}
                          {proposal?.status != "REJECTED" && (
                            <button
                              className={`btn rounded-pill btn-outline-info mx-1 my-1 ${
                                contracts?.isTEApproved ? "disabled" : ""
                              }`}
                              data-bs-target="#exampleModalToggle97"
                              data-bs-toggle="modal"
                            >
                              Reject
                            </button>
                          )}
                          {proposal?.status == "HIRED" && (
                            <Link
                              className={`btn rounded-pill btn-outline-info mx-1 my-1`}
                              href={`/dashboard/tasks/${id}/proposals`}
                              onClick={() =>
                                navigate(`/dashboard/tasks/${id}/proposals`)
                              }
                            >
                              {" "}
                              Proposals ({proposalCount})
                            </Link>
                          )}
                          <button
                            className="btn rounded-pill btn-outline-info mx-1 my-1"
                            onClick={() => {
                              setShowModal(true);
                            }}
                          >
                            {contracts?.id && !contracts?.isTEApproved
                              ? "Edit "
                              : ""}{" "}
                            Contract {contracts?.isTEApproved ? "✔" : ""}{" "}
                            {contracts?.id ? "✔" : ""}
                          </button>
                          {((contracts?.isTEApproved &&
                            task?.amountType === "FIXED") ||
                            (contracts?.isTEApproved &&
                              task?.amountType === "HOURLY" &&
                              proposal?.status === "HIRED")) && (
                            <button
                              className="btn rounded-pill btn-outline-info mx-1 my-1"
                              onClick={() => {
                                const modalElement = document.getElementById(
                                  "exampleHiredProposal"
                                );
                                if (modalElement) {
                                  const modalInstance = new Modal(modalElement);
                                  modalInstance.show();
                                }
                              }}
                            >
                              Milestone {areAllMilestonesApproved ? "✔" : ""}{" "}
                              {milestones?.length > 0 &&
                              milestones[0]?.amount !== ""
                                ? "✔"
                                : ""}
                            </button>
                          )}

                          {((task?.amountType === "FIXED" &&
                            areAllMilestonesApproved &&
                            proposal?.status !== "HIRED") ||
                            (task?.amountType === "HOURLY" &&
                              contracts?.isTEApproved &&
                              proposal?.status !== "HIRED")) && (
                            <button
                              className="btn rounded-pill btn-outline-info mx-1 my-1"
                              onClick={handleHireClick}
                            >
                              Hire
                            </button>
                          )}
                          {areAllMilestonesPaid && (
                            <button
                              className={`btn rounded-pill btn-outline-info mx-1 ls ${
                                dispute[0]?.id || task?.status == "COMPLETED"
                                  ? "disabled"
                                  : ""
                              }`}
                              onClick={() => updateTask("COMPLETED")}
                            >
                              Complete ✔
                            </button>
                          )}
                          <button
                            className="btn rounded-pill btn-outline-info mx-1 my-1"
                            onClick={() => getMessageThread(proposal)}
                          >
                            Message
                          </button>
                        </>
                      ) : (
                        <>
                          {contracts.id ? (
                            <button
                              className="btn rounded-pill btn-outline-info mx-1 my-1"
                              onClick={() => setShowModal(true)}
                            >
                              View Contract
                            </button>
                          ) : (
                            ""
                          )}
                          {milestones?.length > 0 &&
                            milestones[0]?.id &&
                            task?.id && (
                              <button
                                className="btn rounded-pill btn-outline-info mx-1 my-1"
                                data-bs-target="#exampleHiredProposal"
                                data-bs-toggle="modal"
                              >
                                {" "}
                                Milestone{" "}
                              </button>
                            )}
                        </>
                      )}
                      {task?.status == "INPROGRESS" && (
                        <button
                          className="btn rounded-pill btn-outline-info mx-1 my-1"
                          data-bs-target="#exampleModalToggle11"
                          data-bs-toggle="modal"
                        >
                          Dispute
                        </button>
                      )}
                      {addReview && task?.reviews?.length > 0
                        ? task?.reviews?.map((review: any) =>
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
                    </div>
                  )}
                  {proposal?.status === "HIRED" &&
                    milestones?.length > 0 &&
                    milestones[0]?.status === "PAYMENT_PENDING" &&
                    user?.profile?.length > 0 &&
                    user?.profile[0]?.type == "TR" && (
                      <div className="alert alert-warning mt-3" role="alert">
                        <strong>Action Required:</strong> Please fund the
                        milestones to proceed with the task.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`col-md-6 transition-all duration-300 ${
              showJobDetails
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            {showJobDetails && (
              <div className="my-project pt-3 mx-3 mx-md-0 mt-4">
                <div className="row mx-3 mt-2">
                  <div className="col-auto ms-0 ps-0">
                    <Link
                      className="text-lg-end card-profile  mt-4 "
                      href={`/dashboard/talent-requestors/${task?.requesterProfile?.userId}`}
                      onClick={() =>
                        navigate(
                          `/dashboard/talent-requestors/${task?.requesterProfile?.userId}`
                        )
                      }
                    >
                      <div className="inerprofile text-center">
                        <ImageFallback
                          src={
                            task?.requesterProfile?.user?.profilePicture
                              ?.fileUrl
                          }
                          fallbackSrc={defaultUserImg}
                          alt="img"
                          className="img-round"
                          width={60}
                          height={60}
                          loading="lazy"
                          blurDataURL={profileImageBlurDataURL}
                          userName={
                            task?.requesterProfile?.user
                              ? `${task?.requesterProfile?.user?.firstName} ${task?.requesterProfile?.user?.lastName}`
                              : null
                          }
                        />
                        <h2 className="ms-1">
                          {task?.requesterProfile?.user?.firstName}{" "}
                          {task?.requesterProfile?.user?.lastName}
                        </h2>
                        <RatingStar
                          rating={
                            task?.requesterProfile?.averageRating
                              ? task?.requesterProfile?.averageRating
                              : 0
                          }
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="col pe-4 mt-2 ">
                    <div className="priceanddate  justify-content-between bordr ">
                      <div className="d-flex flex-wrap align-items-baseline">
                        <div className="priceanddate d-flex justify-content-between ">
                          <div className="d-flex align-items-baseline">
                            <div className="stars mb-2">
                              <h3 className="me-3 ms-lg-0 text-light">
                                {task?.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 
                                           ${
                                             task?.status === "INPROGRESS"
                                               ? "text-bg-warning"
                                               : task?.status === "COMPLETED"
                                               ? "text-bg-success"
                                               : task?.status === "POSTED"
                                               ? "text-bg-primary"
                                               : task?.status === "CLOSED"
                                               ? "text-bg-danger"
                                               : ""
                                           }`}
                        >
                          {task?.status}
                        </span>
                        <span
                          className={`badge ms-0 ms-lg-3 ms-md-3 mb-3 
                                           ${
                                             task?.taskType === "ONLINE"
                                               ? "text-bg-success"
                                               : task?.status === "POSTED"
                                               ? "text-bg-primary"
                                               : ""
                                           }`}
                        >
                          {task?.taskType}
                        </span>
                      </div>
                      <div className="pricedate me-4 ">
                        {task?.amountType === "HOURLY" ? (
                          <h5>$ {task?.amount} / hr</h5>
                        ) : (
                          <h5>$ {task?.amount}</h5>
                        )}
                      </div>
                    </div>
                    <div className="">
                      <div className="card-footer d-flex flex-wrap justify-content-between pb-4">
                        <div className="d-flex  justify-content-between category-btns">
                          <button
                            className="btn btn-dark btn-sm rounded-pill ls mt-2 mx-1 w-s"
                            style={{ pointerEvents: "none" }}
                          >
                            {task?.categories?.length > 0 &&
                              task?.categories[0]?.category?.parentCategory
                                ?.name}
                          </button>
                          {task?.categories?.map((cat: any, id: number) => (
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
                <div className="d-flex justify-content-between">
                  <h3 className="me-2 text-white">{task?.name}</h3>
                  <h5 className="w-9 text-white">$ {task?.amount}</h5>
                </div>
                <HtmlData data={task?.details} className="text-white" />
              </div>
            )}
          </div>
          <div className="col-lg-12">
            {articles?.length > 0 && (
              <div className="box m-2">
                <div className="accordion" id="accordionExample">
                  {articles?.length > 0 && <h6>Articles</h6>}
                  {articles?.map((article: any, index: number) => (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed bg-black text-white"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse${index}`}
                        >
                          {article?.article?.title}
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body bg-gray text-white">
                          <HtmlData data={article?.article?.description} />
                          <div
                            className={`d-md-flex align-items-center justify-content-between mt-3`}
                          >
                            {/* <div className='d-flex flex-wrap mb-2 mb-md-0'>
                            <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2`}>Networking</button>
                            <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2`}>Development</button>
                            <button type="button" className={`btn btn-gray text-light btn-sm rounded-pill me-2`}>AI blockchain</button>
                          </div> */}
                            <div className="d-flex">
                              {/* <div className={`d-flex mb-2 mb-md-0`}>
                              <Icon icon="ri:facebook-fill" className='me-2 text-light' />
                              <Icon icon="lets-icons:insta" className="me-2 text-light" />
                              <Icon icon="mdi:twitter" className="me-2 text-light" />
                              <Icon icon="mdi:youtube" className='me-2 text-light' />
                            </div> */}
                              <div className="d-flex mb-2 mb-md-0">
                                <Link
                                  className="btn btn-outline-info rounded-pill text-white fs-10 btn-sm ls"
                                  href={`/dashboard/articles/${article?.articleId}`}
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/articles/${article?.articleId}`
                                    )
                                  }
                                >
                                  View Details{" "}
                                  <Icon
                                    icon="line-md:arrow-right"
                                    className="ms-1"
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DisputeModal type={false} taskId={id} proposalId={proposalId} />
      <SubmitReview taskId={Number(id)} revieweeId={revieweeId} />
      {showModal && (
        <Contract
          taskId={Number(id)}
          proposalId={proposalId}
          taskStatus={task?.status}
          isOpen={showModal}
          onClose={closeContract}
          task={task}
        />
      )}
      <RejectProposal updateProposals={updateProposals} id={Number(id)} />
      {task?.id && (
        <Hire
          milestone={milestones}
          setMilestones={setMilestones}
          contract={contracts}
          type={type}
          amount={proposal?.amount}
          proposal={proposal}
          areAllMilestonesApproved={areAllMilestonesApproved}
          task={task}
          count={count}
          page={page}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          team={team}
          getTask={getTask}
        />
      )}
      {showHireConfirmModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex={-1}
          aria-labelledby="hireConfirmModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="hireConfirmModalLabel">
                  Confirm Hire
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelHire}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {task?.amountType === "HOURLY" ? (
                  <>
                    <p>How many hours do you want this task to be performed?</p>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={hours}
                      onChange={(e) => {
                        const hoursInput = Number(e.target.value);
                        setHours(hoursInput);
                        setTotalAmount(hoursInput * proposal?.amount);
                      }}
                      min="0"
                      placeholder="Enter number of hours"
                    />
                    <p>Total Amount: ${totalAmount.toFixed(2)}</p>
                    <p>
                      Are you sure you want to hire this expert for {hours}{" "}
                      hours at ${proposal?.amount}/hr?
                    </p>
                  </>
                ) : (
                  <p>Are you sure you want to hire this Talented Expert?</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill"
                  onClick={handleCancelHire}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill"
                  onClick={handleConfirmHire}
                  disabled={task?.amountType === "HOURLY" && hours <= 0}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showHireConfirmModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};
export default ViewProposal;
