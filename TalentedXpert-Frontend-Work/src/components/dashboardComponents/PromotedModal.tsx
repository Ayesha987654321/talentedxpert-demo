import React, { useEffect, useState } from "react";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import PromoteStripeModal from "../common/PromoteStripeWidget/PromoteStripeModal";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PromotedModal = ({
  show,
  handleClose,
  handleResponse,
  title,
  children,
  dispatch,
  router,
}: any) => {
  const [showPayment, setShowPayment] = useState(false);
  const [days, setDays] = useState(1); // Default to 1 day
  const [amount, setAmount] = useState(1); // $1 per day default
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>({});

  const user = useSelector((state: any) => state.user);

  const handleDaysChange = (e: any) => {
    const selectedDays = parseInt(e.target.value);
    setDays(selectedDays);
    setAmount(selectedDays); // $1 per day
  };
  useEffect(() => {
    getWallet();
  }, []);

  const handleYesClick = () => {
    setShowPayment(true);
  };

  const handleNoClick = () => {
    handleClose();
  };

  const handleSubmitPayment = async () => {
    if (amount > wallet?.availableBalance) {
      toast.error("Your wallet dosent have enough balance ");
      return;
    }
    try {
      const response = await apiCall(
        requests.promotion,
        { days, amount, type: "PROFILE" },
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
        handleResponse();
      }
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      setLoading(false);
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
          console.log(res?.data?.data || []);
          setWallet(res?.data?.data);
        }
      })
      .catch((err) => console.warn(err));
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark">
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title text-light">{title}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-light">
            {!showPayment ? (
              <>
                <div className="modal-title text-light">
                  Would you like to promote Talented Xpert profile?
                </div>
                <div className="d-flex justify-content-center mt-4">
                  <button
                    className="btn btn-success mx-2"
                    onClick={handleYesClick}
                  >
                    Yes
                  </button>
                  <button
                    className="btn btn-danger mx-2"
                    onClick={() => {
                      handleResponse();
                      handleClose();
                    }}
                  >
                    No
                  </button>
                </div>
              </>
            ) : (
              <div className="payment-section">
                <h6 className="mb-3 text-light">
                  There will be an initial charge of $1 per day to promote the
                  profile.
                </h6>
                <h6 className="mb-3 text-light">Select Promotion Duration</h6>
                <div className="form-group mb-3">
                  <label htmlFor="days" className="form-label text-light">
                    Number of Days:
                  </label>
                  <select
                    id="days"
                    className="form-control bg-light text-dark"
                    value={days}
                    onChange={handleDaysChange}
                  >
                    {Array.from({ length: 30 }, (_, index) => index + 1).map(
                      (day) => (
                        <option key={day} value={day}>
                          {day} day{day > 1 ? "s" : ""}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="amount-display p-3 bg-secondary rounded mb-4 text-light">
                  <div className="d-flex justify-content-between">
                    <span>Daily Rate:</span>
                    <span>$1.00</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Number of Days:</span>
                    <span>{days}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold mt-2">
                    <span>Total Amount:</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={() => setShowPayment(false)}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={handleSubmitPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </span>
                    ) : (
                      "Promote Profile"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotedModal;
