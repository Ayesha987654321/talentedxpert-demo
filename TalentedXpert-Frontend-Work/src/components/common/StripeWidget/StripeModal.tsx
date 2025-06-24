"use client";
import {
  loadStripe,
  Stripe,
  StripeElementsOptionsClientSecret,
  StripeElementsOptionsMode,
} from "@stripe/stripe-js";
import React, { FC, useEffect, useRef, useState } from "react";
import ModalWrapper from "../ModalWrapper/ModalWrapper";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  `${process.env.REACT_APP_STRIPE_TEST_PUBLISHABLE_KEY}`
);

const StripeModal: FC<any> = ({ isOpen, closeFn, data }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const closeRef = useRef(null);

  const [stripe, setStripe] = useState<Stripe | null>(null);

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntendId, setPaymentIntendId] = useState("");

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  const router = useRouter();

  useEffect(() => {
    const resolveStripePromise = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    };

    resolveStripePromise();
  }, []);

  useEffect(() => {
    setOpenModal(true);
  }, [isOpen]);

  useEffect(() => {
    createPaymentIntend(data);
  }, [data]);

  const createPaymentIntend = async (data: any) => {
    setPaymentIntendId("");
    setClientSecret("");

    const params = {
      taskId: Number(data?.taskId),
      milestoneId: Number(data?.id),
      amountType: data?.amountType,
    };
    await apiCall(
      `${requests.paymentIntend}`,
      params,
      "post",
      true,
      dispatch,
      user,
      router
    )
      .then((res) => {
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
          // setIsFormSubmitted(false)
        }
        res?.data ? setPaymentIntendId(res?.data?.id) : setPaymentIntendId("");
        res?.data
          ? setClientSecret(res?.data?.client_secret)
          : setClientSecret("");
      })
      .catch((err) => console.warn(err));
  };

  const handleClose = () => {
    setOpenModal(false);
    closeFn(true);
  };

  const onClose = () => {
    setOpenModal(false);
    closeFn(false);
  };

  return (
    <>
      {openModal && (
        <ModalWrapper
          modalId={"PaymentModal"}
          title={"Accept"}
          closeRef={closeRef}
          handleClose={onClose}
        >
          <div className="row px-4">
            <div className="">
              {stripe && (!clientSecret || !paymentIntendId) && (
                <SkeletonLoader count={5} />
              )}
              {stripe && clientSecret && paymentIntendId && (
                <Elements
                  stripe={stripePromise}
                  options={
                    {
                      clientSecret,
                      paymentMethodCreation: "manual", // paymentMethodCreation can be omitted if you are not using it
                      loader: "always", // `loader` should be a string literal if it expects specific values
                    } as
                      | StripeElementsOptionsClientSecret
                      | StripeElementsOptionsMode
                  }
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    data={data}
                    paymentIntentId={paymentIntendId}
                    handleClose={handleClose}
                  />
                </Elements>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default StripeModal;
