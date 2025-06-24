import React, { FC, useState } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const CheckoutForm: FC<any> = ({
  data,
  paymentIntentId,
  handleClose,
  saveapicall,
  type
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(true);
  const [postalCode, setPostalCode] = useState<string>("");

  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsFormSubmitted(true);

    if (!stripe || !elements) {
      setIsFormSubmitted(false);
      return;
    }

    await elements.submit();

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      elements,

    });

    if (error) {
      if (error?.type === "card_error" || error?.type === "validation_error") {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
      setIsFormSubmitted(false);
    } else {
      confirmPayment(paymentMethod);

    }
  };

  const confirmPayment = async (paymentMethod: any) => {
    console.log('paymentMethod', paymentMethod)
    const params = {
      paymentIntentId: paymentIntentId,
      paymentMethodId: paymentMethod?.id,
    };

    await apiCall(
      `${type === 'wallet' && requests.confirmDeposit }`,
      params,
      "post",
      false,
      dispatch,
      user,
      router
    )
      .then((res) => {
        if (res.data.success) {
          toast.success(res?.data?.data.message);
          saveapicall();
        }
        handleClose();
      })
      .catch((err) => console.warn(err));
  };

  return (
    <form className="text-start mt-30 pb-30" onSubmit={handleSubmit}>
      {(!stripe || !elements) && <SkeletonLoader count={2} />}
      {stripe && elements && (
        <>
          <div className="text-warning fs-12 mb-2">
            Platform service fee: $ {(data?.amount * 5) / 100}
          </div>

          <PaymentElement
            id="payment"
            className="mb-3"
            onReady={() => setIsShow(false)}
          />

          <div className="form-group mb-3">
            <label htmlFor="postalCode" className="form-label text-secondary fs-11">Postal / Zip Code</label>
            <input
              type="number"
              id="postalCode"
              className="form-control text-dark"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Enter postal or zip code"
              required
            />
          </div>

          <div className="form-group">
            <button
              disabled={isFormSubmitted || !stripe || !elements || isShow}
              className="btn btn-primary text-white mb-3 w-100"
              type="submit"
            >
              {!stripe && !elements ? "Loading..." : "Submit"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default CheckoutForm;
