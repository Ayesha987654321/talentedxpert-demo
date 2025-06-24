"use client";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MsgNotifier from "../MsgNotifier/MsgNotifier";
import { toast } from "react-toastify";
import { Pagination } from "../Pagination/Pagination";
import StripeModal from "../StripeWidget/StripeModal";
import HourlyLogModal from "./hourlyLogModal";
import { Modal } from "bootstrap";
import ConnectNotVerified from "./ConnectNotVerified";
import HtmlData from "../HtmlData/HtmlData";

const Hire: FC<any> = ({
  milestone,
  setMilestones,
  contract,
  type,
  amount,
  proposal,
  areAllMilestonesApproved,
  task,
  count,
  page,
  limit,
  onPageChange,
  onLimitChange,
  team,
  getTask,
}: any) => {
  const user = useSelector((state: RootState) => state.user);
  const [error, setError] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<Number>(0);
  const [weekIndex, setWeekIndex] = useState<Number>(1);
  const [msgNotify, setMsgNotify] = useState<boolean>(false);
  const [milestoneIdsToDelete, setMilestoneIdsToDelete] = useState<number[]>(
    []
  );
  const [checkConditions, setCheckConditions] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [stripeDetail, setStripeDetail] = useState<boolean>(false);
  const [wallet, setWallet] = useState<any>({});
  const [isAccept, setIsAccept] = useState<boolean>(false);
  const [payData, setPayData] = useState<any>({});

  let data = {
    ...(milestone?.length > 0 && {
      milestones: milestone?.map((data: any) => ({
        contractId: contract?.id,
        amount: Number(data?.amount),
        teamMemberProfileId:
          data?.teamMemberProfileId || proposal?.expertProfile?.id,
        title: data?.title,
        details: data?.details,
        duration: data?.date,
        date: new Date(),
        status: type
          ? data?.isTEApproved
            ? data?.status === "PAID"
              ? "PAID"
              : "APPROVED"
            : data?.status
          : "APPROVAL_PENDING",
        isTEApproved: data?.isTEApproved || false,
        isTRApproved: true,
        ...(type && data?.id && { id: Number(data?.id) }),
      })),
    }),
    ...(type && { milestoneIdsToDelete }),
  };

  useEffect(() => {
    if (milestone?.length === 0 && task?.amountType !== 'HOURLY') {
      setMilestones([
        {
          amount: "",
          date: "",
          title: "",
          details: "",
          status: "APPROVAL_PENDING",
          isTEApproved: false,
        },
      ]);
      setError("");
    } else if (milestone?.length > 0) {
      const updatedTotalAmount = milestone?.reduce(
        (acc: number, item: any) => acc + (Number(item?.amount) || 0),
        0
      );
      setTotalAmount(updatedTotalAmount);
      setError("");
    }
  }, [milestone,]);

  const onDelete = (id: number, index: any) => {
    setMilestoneIdsToDelete((prev: number[]) => [...prev, id]);
    // setMilestoneIdsToDelete((prev: number) => [...prev, id]);
    const updatedQuestions = milestone.filter(
      (_: any, i: number) => i !== index
    );
    setMilestones(updatedQuestions);
  };

  const addMilestone = () => {
    const incomplete = milestone?.some(
      (m: any) => !m.amount || !m.date || !m.title || !m.details
    );
    if (incomplete) {
      setError("Please fill in all fields before adding a new milestone.");
      return;
    } else {
      setError("");
      setMilestones((prev: any) => [
        ...prev,
        { amount: "", status: "APPROVAL_PENDING" },
      ]);
    }
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

  // console.log('check fund now', milestone, task.amountType, user.profile[0].type)

  const handledate = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newQuestionArr = [...milestone];
    newQuestionArr[index].date = e.target.value;
    setMilestones(newQuestionArr);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newMilestone = [...milestone];
    newMilestone[index].amount = e.target.value;
    setMilestones(newMilestone);
  };

  const handleTitle = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newMilestone = [...milestone];
    newMilestone[index].title = e.target.value;
    setMilestones(newMilestone);
  };

  const handleDetails = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newMilestone = [...milestone];
    newMilestone[index].details = e.target.value;
    setMilestones(newMilestone);
  };
  const handleTeam = (e: any, index: number) => {
    console.log("change");
    const newMilestone = [...milestone];
    newMilestone[index].teamMemberProfileId = Number(e);
    setMilestones(newMilestone);
    console.log("new", newMilestone);
  };

  const handleSubmit = async () => {
    const incomplete = milestone?.some(
      (m: any) => !m.amount || !m.date || !m.title || !m.details
    );
    if (incomplete) {
      setError("Please fill in all fields before adding a new milestone.");
      return;
    } else {
      setError("");
      await apiCall(
        requests.makeMilestone,
        data,
        `${type ? "patch" : "post"}`,
        true,
        dispatch,
        user,
        router
      )
        .then((res: any) => {
          if (!type) {
            setMsgNotify(true);
          }
          const modalElement = document.getElementById("exampleHiredProposal");
          if (modalElement) {
            let modalInstance = Modal.getInstance(modalElement);
            if (!modalInstance) {
              modalInstance = new Modal(modalElement);
            }
            modalInstance.hide();

            // Force cleanup in case Bootstrap doesn't
            setTimeout(() => {
              const backdrops = document.querySelectorAll(".modal-backdrop");
              backdrops.forEach((el) => el.remove());
              document.body.classList.remove("modal-open");
              document.body.style.overflow = "";
            }, 300);
          }
          // toast.success("Submitted");
          console.log('res mileee', res)
          if (res.error) {

            toast.error(res.error.message);
          }
          else {
            toast.success("Submitted");

          }

          getMilestones(contract?.id);
        })
        .catch((err) => console.warn(err));
    }
  };
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

  const handleApprove = async (index: number) => {
    if (!checkConditions) {
      toast.error("Please accept the Terms and Conditions to proceed.");
      return;
    } else {
      const newMilestones = [...milestone];
      newMilestones[index].isTEApproved = true;
      newMilestones[index].status = "APPROVED";
      newMilestones[index].teamMemberProfileId =
        data?.milestones[index]?.teamMemberProfileId;
      console.log("check", checkConditions);


      await apiCall(
        requests.makeMilestone,
        {
          ...data,
          milestones: [...newMilestones],
        },
        "patch",
        false,
        dispatch,
        user,
        router
      )
        .then((res: any) => {
          setMilestones(newMilestones);
          toast.success("Approved successfully");
        })
        .catch((err) => console.warn(err));

    }

  };

  const termsConditions = async (check: boolean) => {
    console.log('termsAccepted: checkConditions', checkConditions)
    await apiCall(
      requests.editContract + contract?.id,
      {
        termsAccepted: check,
      },
      "put",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        console.log('res term', res)
      })
      .catch((err) => console.warn(err));
  }


  const handlePayNow = async (data: any) => {
    console.log("data", data);
    if (proposal?.status !== "HIRED") {
      toast.error("You need to HIRE the Xpert first");
      return;
    }
    if (wallet?.availableBalance < data?.amount && data?.status !== "FUNDED") {
      toast.error("Your wallet dosent have enough balance");
      return;
    }
    if (data?.status === "FUNDED") {
      const hasReviewed = task?.reviews?.some(
        (review: any) => review?.reviewerProfileId === user?.profile[0]?.id
      );

      if (!hasReviewed) {
        toast.error('You need to submit the review first');
        return;
      }
    }
    await apiCall(
      data.status === "APPROVED" || data.status === "PAYMENT_PENDING"
        ? requests?.milestoneFund
        : requests?.milestoneRelease,
      {
        milestoneId: data?.id,
        taskId: task?.id,
      },

      "post",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        toast.success(res?.data?.message);
        if (task?.amountType == "HOURLY") {
          getTask();
        } else {
          getMilestones(contract?.id);
        }
      })
      .catch((err) => console.warn(err));

    // setIsAccept(true);
    setPayData({
      ...data,
      amountType: task?.amountType,
      taskId: task?.id,
    });
  };

  const closeFn = async (isClose: boolean) => {
    isClose ? await getMilestones(payData?.contractId) : "";
    setIsAccept(false);
    setError("");
    setPayData({});
  };

  const setId = (index: number) => {
    setWeekIndex(index);
    // Manually show HourlyLogModal without hiding parent
    const childModal = document.getElementById("exampleModalToggle555");
    const parentModal = document.getElementById("exampleHiredProposal");
    if (childModal && parentModal) {
      // Remove aria-hidden from parent to fix accessibility warning
      parentModal.removeAttribute("aria-hidden");
      // Ensure parent modal stays visible
      parentModal.classList.add("show");
      parentModal.style.display = "block";
      // Show child modal
      childModal.classList.add("show");
      childModal.style.display = "block";
      // Trap focus in child modal
      childModal.focus();
    }
  };

  const getMilestones = async (id: number) => {
    let params: any = "?taskId=" + task?.id;
    params += "&contractId=" + Number(id);
    await apiCall(
      `${requests.getMilestones}${params}`,
      {},
      "get",
      false,
      dispatch,
      user,
      router
    )
      .then((res: any) => {
        setMilestones(res?.data?.data?.milestones);
      })
      .catch((err) => console.warn(err));
  };
  useEffect(() => {
    getConnectAccount();
    getWallet();

  }, []);

  useEffect(() => {
    console.log('term', contract)
    setCheckConditions(contract?.termsAccepted)

  }, [contract])


  const formatDate = (dateString: any) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "";
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  return (
    <div>
      <div className="create-milstone">
        <div
          className="modal fade"
          id="exampleHiredProposal"
          aria-hidden="true"
          aria-labelledby="exampleModalHiredProposal"
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog modal-xl">
            <div className="modal-content p-r">
              <div className="modal-header justify-content-between">
                <button
                  type="button"
                  className="btn-close bg-light p-a me-3"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => closeFn(false)}
                ></button>
                <h5 className="modal-title text-white">
                  {user?.profile?.length > 0 && user?.profile[0]?.type === "TR"
                    ? "Create Milestone"
                    : "Milestones"}
                </h5>
                {/* <div className="d-flex">
                  {!areAllMilestonesApproved &&
                    (user?.profile[0]?.type === "TR" ||
                      (user?.profile[0]?.type === "TE" && team?.id)) && (
                      <Icon
                        icon="line-md:plus-square-filled"
                        className={`text-info mx-5 ${totalAmount === amount ? "disabled" : ""
                          }`}
                        width={32}
                        height={32}
                        onClick={addMilestone}
                      />
                    )}
                </div> */}
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col">SR</th>
                        <th scope="col-2">Title</th>
                        <th scope="col-3">Description</th>
                        {team?.id && user?.profile[0]?.type === "TE" && (
                          <th scope="col">Member Name</th>
                        )}
                        {task?.amountType == "HOURLY" && <th>Hours</th>}
                        <th scope="col">Amount</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                        {!(
                          user?.profile[0]?.type === "TE" &&
                          task?.amountType === "HOURLY"
                        ) && (
                            <th scope="col-2" className="text-center">
                              Action
                            </th>
                          )}
                      </tr>
                    </thead>
                    <tbody className="table-dark">
                      {milestone?.length > 0 &&
                        milestone.map((data: any, index: number) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {user?.profile[0]?.type === "TR" &&
                                task?.amountType === "FIXED" &&
                                milestone[index]?.status == "APPROVAL_PENDING" ? (
                                <input
                                  type="text"
                                  value={
                                    task?.amountType == "HOURLY"
                                      ? `Week ${data?.week}`
                                      : data?.title
                                  }
                                  readOnly={
                                    (user?.profile[0]?.type === "TE" &&
                                      !team?.id) ||
                                    areAllMilestonesApproved
                                  }
                                  className="form-control text-white"
                                  id="exampleFormControlInput2"
                                  placeholder="Title"
                                  onChange={(e) => handleTitle(e, index)}
                                />
                              ) : (
                                <span className="text-white">
                                  {task?.amountType == "HOURLY"
                                    ? `Week ${data?.week}`
                                    : data?.title}
                                </span>
                              )}
                            </td>
                            <td>
                              {task?.amountType === "HOURLY" ? (
                                <button
                                  className="btn rounded-pill btn-outline-info mx-1 my-1"
                                  onClick={() => setId(index)}
                                >
                                  Hours Log
                                </button>
                              ) : user?.profile[0]?.type === "TR" &&
                                task?.amountType === "FIXED" &&
                                milestone[index]?.status == "APPROVAL_PENDING" ? (
                                <input
                                  type="text"
                                  value={data?.details}
                                  readOnly={
                                    (user?.profile[0]?.type === "TE" &&
                                      !team?.id) ||
                                    areAllMilestonesApproved
                                  }
                                  className="form-control text-white"
                                  id="exampleFormControlInput2"
                                  placeholder="Description"
                                  onChange={(e) => handleDetails(e, index)}
                                />
                              ) : (
                                <span className="text-white">
                                  {data?.details}
                                </span>
                              )}
                            </td>

                            {team?.id && user?.profile[0]?.type === "TE" && (
                              <td>
                                <select
                                  value={data?.teamMemberProfileId}
                                  className="form-select form-select-sm bg-gray text-white border-0 py-2 px-4"
                                  id="taskDropdown"
                                  // defaultValue=""
                                  onChange={(e) =>
                                    handleTeam(e?.target?.value, index)
                                  }
                                >
                                  <option value="" disabled>
                                    Select Member
                                  </option>
                                  {team?.teamMembers?.map((data: any) => (
                                    <option
                                      value={data?.memberProfileId}
                                      key={data?.id}
                                    >
                                      {data?.profile?.user?.firstName}{" "}
                                      {data?.profile?.user?.lastName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            )}
                            {task?.amountType === "HOURLY" && (
                              <td>
                                <span className="mt-2">
                                  {Math.floor(data?.totalHours / 60)}h{" "}
                                  {data?.totalHours % 60}m
                                </span>
                              </td>
                            )}
                            <td>
                              {user?.profile[0]?.type === "TR" &&
                                task?.amountType === "FIXED" &&
                                milestone[index]?.status == "APPROVAL_PENDING" ? (
                                <input
                                  type="number"
                                  value={
                                    task?.amountType == "HOURLY"
                                      ? data?.maxAmount
                                      : data?.amount
                                  }
                                  readOnly={
                                    (user?.profile[0]?.type === "TE" &&
                                      !team?.id) ||
                                    areAllMilestonesApproved
                                  }
                                  className="form-control text-white"
                                  id="exampleFormControlInput1"
                                  placeholder="$"
                                  onChange={(e) => handleChange(e, index)}
                                />
                              ) : (
                                <span className="text-white">
                                  {task?.amountType == "HOURLY"
                                    ? data?.maxAmount
                                    : data?.amount}
                                </span>
                              )}
                            </td>

                            <td>
                              {user?.profile[0]?.type === "TR" &&
                                task?.amountType === "FIXED" &&
                                milestone[index]?.status == "APPROVAL_PENDING" ? (
                                <input
                                  type="date"
                                  className="bg-gray text-white border-0 p-1"
                                  readOnly={
                                    (user?.profile[0]?.type === "TE" &&
                                      !team?.id) ||
                                    areAllMilestonesApproved
                                  }
                                  value={
                                    (data?.date || data?.createdAt) &&
                                      !isNaN(
                                        new Date(
                                          data?.date || data?.createdAt
                                        ).getTime()
                                      )
                                      ? new Date(data?.date || data?.createdAt)
                                        .toISOString()
                                        .split("T")[0]
                                      : ""
                                  }
                                  onChange={(e) => handledate(e, index)}
                                />
                              ) : (
                                // <span className="text-white">
                                //   {data?.endDate && !isNaN(new Date(data.date).getTime())
                                //     ? formatedDate(data.date)
                                //     : ""}
                                // </span>
                                <span className="text-white">
                                  {formatDate(data?.date || data?.createdAt)}
                                </span>

                                // <span className="text-white">
                                //   {(data?.date || data?.createdAt) &&
                                //     !isNaN(
                                //       new Date(
                                //         data?.date || data?.createdAt
                                //       ).getTime()
                                //     )
                                //     ? new Date(data?.date || data?.createdAt)
                                //       .toISOString()
                                //       .split("T")[0]
                                //     : ""}
                                // </span>
                              )}
                            </td>
                            <td>
                              {data?.status === "APPROVAL_PENDING"
                                ? "Pending"
                                : data?.status}
                            </td>
                            <td className="d-flex align-items-center justify-content-center">
                              {/* Plus Icon to Add New Milestone */}
                              {console.log(
                                "are all approved",
                                areAllMilestonesApproved
                              )}
                              {!areAllMilestonesApproved &&
                                task?.amountType !== "HOURLY" &&
                                (user?.profile[0]?.type === "TR" ||
                                  (user?.profile[0]?.type === "TE" &&
                                    team?.id)) &&
                                milestone[index]?.status == "APPROVAL_PENDING" && (
                                  <>
                                    <Icon
                                      icon="line-md:plus-square-filled"
                                      className={`text-info mx-1 btn-sm ${totalAmount === amount ? "disabled" : ""
                                        }`}
                                      width={24}
                                      height={24}
                                      onClick={() => {
                                        const incomplete =
                                          !data.amount ||
                                          !data.date ||
                                          !data.title ||
                                          !data.details;
                                        if (incomplete) {
                                          setError(
                                            "Please fill in all fields for this milestone before adding a new one."
                                          );
                                          return;
                                        }
                                        setError("");
                                        setMilestones((prev: any) => [
                                          ...prev,
                                          {
                                            amount: "",
                                            status: "APPROVAL_PENDING",
                                            title: "",
                                            details: "",
                                            date: "",
                                          },
                                        ]);
                                      }}
                                    />
                                    <Icon
                                      icon="line-md:minus-square-filled"
                                      className="text-info mx-1 btn-sm"
                                      width={24}
                                      height={24}
                                      onClick={() => onDelete(data.id, index)}
                                    />
                                  </>
                                )}
                              {/* Existing Action Buttons/Icons */}
                              {user?.profile?.length > 0 &&
                                user?.profile[0]?.type === "TE" &&
                                task?.amountType == "FIXED" ? (
                                milestone[index]?.isTEApproved ? (
                                  <span className="mx-1">✔</span>
                                ) : (
                                  <button
                                    className="btn rounded-pill btn-outline-info mx-1 my-1"
                                    onClick={() => handleApprove(index)}
                                  >
                                    Accept
                                  </button>
                                )
                              ) : (
                                ""
                              )}

                              {user?.profile?.[0]?.type === "TR" &&
                                (task?.amountType === "HOURLY" ||
                                  milestone[index]?.isTEApproved) ? (
                                <button
                                  className="btn rounded-pill btn-outline-info mx-1 my-1"
                                  disabled={milestone[index]?.status === "PAID"}
                                  onClick={() => handlePayNow(data)}
                                >
                                  {milestone[index]?.status === "FUNDED"
                                    ? "Pay Now"
                                    : milestone[index]?.status === "PAID"
                                      ? "PAID"
                                      : milestone[index]?.status ===
                                        "PAYMENT_PENDING" ||
                                        milestone[index]?.status === "APPROVED"
                                        ? "Fund Now"
                                        : ""}
                                </button>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))}
                      <tr>
                        <td colSpan={10}>
                          <span className="pt-3 pb-3">
                            Total Amount :
                            <span className="text-white ms-2">
                              ${String(totalAmount)}
                            </span>
                          </span>
                          {user?.profile[0]?.type === "TR" && (
                            <div className="text-danger fs-12">
                              * Total amount should be equal to proposal amount{" "}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {user?.profile[0]?.type === "TR" ? (
                    <div className="text-warning fs-12">
                      Note: Platform service fee of 5% will be deducted on each
                      milestone
                    </div>
                  ) : (
                    !areAllMilestonesApproved &&
                    ((task?.status !== "COMPLETED" &&
                      task?.status !== "INPROGRESS") ||
                      (task?.amountType === "HOURLY" &&
                        task?.status === "INPROGRESS")) && (
                      <div className="mb-3">
                        <input
                          type="checkbox"
                          checked={checkConditions}
                          id={"Teams"}
                          className="form-check-input bg-dark border-light"
                          onChange={() => {
                            if (checkConditions) {
                              setCheckConditions(false);
                              termsConditions(false);
                            } else {
                              setCheckConditions(true);
                              termsConditions(true);
                            }
                          }}
                        />
                        <label
                          htmlFor={"Terms"}
                          className="form-check-label ms-2"
                        >
                          <HtmlData
                            data={"I agree to the terms and conditions"}
                            className="text-white"
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-grid gap-2"></div>
                {(user?.profile[0]?.type === "TR" ||
                  (user?.profile[0]?.type === "TE" && team?.id)) &&
                  task?.status !== "COMPLETED" &&
                  task?.status !== "INPROGRESS" &&
                  !areAllMilestonesApproved && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={totalAmount !== amount}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  )}
              </div>
              {count > 10 && (
                <Pagination
                  count={count}
                  page={page}
                  limit={limit}
                  onPageChange={onPageChange}
                  onLimitChange={onLimitChange}
                  siblingCount={1}
                />
              )}
            </div>
          </div>
        </div>
        {/* {isAccept && (
          <StripeModal isOpen={isAccept} closeFn={closeFn} data={payData} />
        )} */}
        <HourlyLogModal task={task} weekIndex={weekIndex} />
        {msgNotify && (
          <MsgNotifier
            senderProfileId={user.id}
            receiverProfileId={contract?.updatedBy}
            text="Milestone has been created"
            taskId={contract?.proposal?.taskId}
          />
        )}
        {/* {proposal && <ConnectNotVerified />} */}
      </div>
    </div>
  );
};

export default Hire;
