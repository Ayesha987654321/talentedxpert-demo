"use client";
import { dataForServer } from "@/models/taskModel/taskModel";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import PromoteStripeModal from "../PromoteStripeWidget/PromoteStripeModal";
const Promotion = ({
  isOpen,
  onClose,
  register,
  watch,
  setValue,
  activeStep,
  setActiveStep,
  data,
  reset,
  setIsFormSubmitted,
  type,
  id,
}: any) => {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [stripemodalopen, setstripemodalopen] = useState<boolean>(false);
  const [addtaskid, setaddtaskid] = useState(null);
  const [wallet, setWallet] = useState<any>({});
  console.log("wallet", wallet);
  console.log("addtaskid", addtaskid);
  // State to track number of days and total amount
  const [promotionDays, setPromotionDays] = useState<number | "">("");
  const promotionRate = 1; // $1 per day
  const totalAmount = promotionDays ? promotionDays * promotionRate : 0;

  // Watch the 'promoted' radio button value
  const isPromoted = watch("promoted");
  console.log("isPromoted", isPromoted);
  const closeFn = () => {
    // isClose ? await getMilestones(payData?.contractId) : ''
    setstripemodalopen(false);
    // setError('')
    // setPayData({})
  };
  const [dayOptions, setDayOptions] = useState<number[]>([]);

  useEffect(() => {
    if (data?.startDate && data?.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        const options = Array.from({ length: totalDays }, (_, i) => i + 1);
        setDayOptions(options);
      }
    }
  }, [data?.startDate, data?.endDate]);
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Reset promotionDays when promotion is not selected
  useEffect(() => {
    if (isPromoted === "false") {
      setPromotionDays("");
    }
  }, [isPromoted]);

  const handleClose = () => {
    setIsFormSubmitted(false);
    setPromotionDays("");
    onClose();
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
          console.log(res?.data?.data || []);
          setWallet(res?.data?.data);
        }
      })
      .catch((err) => console.warn(err));
  };
  useEffect(() => {
    getWallet();
  }, []);

  const promotionFunction = async (Id: any) => {
    if (totalAmount > wallet?.availableBalance) {
      toast.error("Your wallet dosent have enough balance ");
      return;
    }
    try {
      const response = await apiCall(
        requests.promotion,
        {
          days: promotionDays,
          amount: totalAmount,
          taskId: id || Id,
          type: "TASK",
        },
        "post",
        true,
        dispatch,
        user,
        router
      );
      if (!response?.data?.success) {
        console.error("Payment error:", response.error);
      } else {
        console.log("res pp", response);
        toast.success(response?.data?.data?.message);
        handleClose();
        // handleResponse();
      }
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Include promotionDays and totalAmount in formData if promoted
    // const formData = dataForServer({
    //   ...data,
    //   promoted: watch('promoted'),
    //   ...(watch('promoted') === 'true' && {
    //     promotionDays: Number(promotionDays),
    //     promotionTotal: totalAmount,
    //   }),
    // })
    console.log("pp first", isPromoted, promotionDays, type);
    if ((isPromoted === "true" && type && promotionDays !== "") || 0) {
      console.log("pp");
      promotionFunction(id);
      return;
    }
    if ((promotionDays === "" || 0) && isPromoted === "true") {
      toast.error("Select no of days for which you want to promote the task");
      return;
    }
    const formData = dataForServer({
      ...data,
      promoted: false,
    });

    await apiCall(
      `${type ? requests.editTask + id : requests.addtask}`,
      formData,
      `${type ? "put" : "post"}`,
      true,
      dispatch,
      user,
      router
    )
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
          setIsFormSubmitted(false);
        } else {
          if (isPromoted === "true") {
            console.log("setaddtaskid", res);
            setaddtaskid(res?.data?.task.id);
            promotionFunction(res?.data?.task.id);
            handleClose();
          }
          toast.success(res?.data?.message);
          setIsFormSubmitted(false);
          reset({});
          handleClose();
          router.push("/dashboard/tasks");
        }
      })
      .catch((err) => {
        setIsFormSubmitted(false);
        console.warn(err);
      });
  };
  const afterpaymentapicall = () => {
    const formData = dataForServer({
      ...data,
      promoted: watch("promoted"),
    });

    toast.success("Task created successfully");
    setIsFormSubmitted(false);
    reset({});
    handleClose();
    router.push("/dashboard/tasks");
    // apiCall(
    //   requests.editTask + (addtaskid ? addtaskid : id),
    //   formData,
    //   "put",
    //   true,
    //   dispatch,
    //   user,
    //   router
    // )
    //   .then((res: any) => {
    //     let message: any;
    //     if (res?.error) {
    //       message = res?.error?.message;
    //       if (Array.isArray(message)) {
    //         message?.map((msg: string) =>
    //           toast.error(msg ? msg : "Something went wrong, please try again")
    //         );
    //       } else {
    //         toast.error(
    //           message ? message : "Something went wrong, please try again"
    //         );
    //       }
    //       setIsFormSubmitted(false);
    //     } else {
    //       toast.success(res?.data?.message);
    //       setIsFormSubmitted(false);
    //       reset({});
    //       handleClose();
    //       router.push("/dashboard/tasks");
    //     }
    //   })
    //   .catch((err) => {
    //     setIsFormSubmitted(false);
    //     console.warn(err);
    //   });
  };
  return (
    <>
      {open && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          id="exampleModalToggle2"
          aria-hidden="true"
          aria-labelledby="exampleModalToggleLabel2"
          tabIndex={1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title text-black"
                  id="exampleModalToggleLabel2"
                >
                  Would you like to promote your task?
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="form-check radio me-4">
                    <label className="form-check-label" htmlFor="promoteYes">
                      <input
                        {...register("promoted")}
                        value="true"
                        className="form-check-input"
                        type="radio"
                        name="promoted"
                        id="promoteYes"
                      />
                      Yes
                    </label>
                  </div>
                  <div className="form-check radio me-3">
                    <label className="form-check-label" htmlFor="promoteNo">
                      <input
                        {...register("promoted")}
                        value="false"
                        className="form-check-input"
                        type="radio"
                        name="promoted"
                        id="promoteNo"
                      />
                      No
                    </label>
                  </div>
                </div>

                {/* Show days input and rate info when 'Yes' is selected */}
                {/* {isPromoted === "true" && (
                  <div className="mb-3">
                    <label htmlFor="promotionDays" className="form-label">
                      How many days would you like to promote the task?
                    </label>
                    <input
                      type="number"
                      className="form-control text-dark"
                      id="promotionDays"
                      value={promotionDays}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPromotionDays(value === "" ? "" : Number(value));
                      }}
                      min="1"
                      placeholder="Enter number of days"
                    />
                    <div className="mt-2">
                      <p>Rate: $5 per day</p>
                      {promotionDays && <p>Total Amount: ${totalAmount}</p>}
                    </div>
                  </div>
                )} */}
                {isPromoted === "true" && (
                  <div className="mb-3">
                    <label htmlFor="promotionDays" className="form-label">
                      How many days would you like to promote the task?
                    </label>
                    <select
                      id="promotionDays"
                      className="form-select text-dark"
                      value={promotionDays}
                      onChange={(e) =>
                        setPromotionDays(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    >
                      <option value="">Select number of days</option>
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day} {day === 1 ? "day" : "days"}
                        </option>
                      ))}
                    </select>
                    {wallet.availableBalance < totalAmount && isPromoted && (
                      <p className="text-danger">Insufficient balance in wallet</p>
                    )}
                    <div className="mt-2">
                      <p>Rate: $1 per day</p>
                      {promotionDays && <p>Total Amount: ${totalAmount}</p>}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  disabled={
                    wallet?.availableBalance < totalAmount &&
                    isPromoted === "true"
                  }
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
              {/* {stripemodalopen && (
                <PromoteStripeModal
                  isOpen={stripemodalopen}
                  closeFn={closeFn}
                  saveapicall={afterpaymentapicall}
                  data={{
                    days: promotionDays,
                    amount: totalAmount,
                    taskId: id || addtaskid,
                    type: "TASK",
                  }}
                />
              )} */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Promotion;
