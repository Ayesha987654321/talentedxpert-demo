"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { LoginSchema } from "@/schemas/login-schema/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { dataForServer } from "@/models/loginModel/loginModel";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/Store";
import { saveToken, setAuthState } from "@/reducers/AuthSlice";
import GoogleProvider from "../common/SOSComponent/Google/GoogleProvider";
import LinkedInBtn from "../common/SOSComponent/LinkedIn/LinkedInBtn";
import { useNavigation } from "@/hooks/useNavigation";
import Link from "next/link";

type FormSchemaType = z.infer<typeof LoginSchema>;

const Signin = () => {
  const dispatch = useAppDispatch();

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const router = useRouter();
  const { navigate } = useNavigation();

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<FormSchemaType>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      loginAs: "TE",
    },
    resolver: zodResolver(LoginSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    setIsFormSubmitted(true);
    const formData = dataForServer(data);

    await apiCall(requests.login, formData, "post", true, dispatch, null, null)
      .then((res: any) => {
        if (res?.error) {
          toast.error(res?.error?.message || "Something went wrong");
          setIsFormSubmitted(false);
        } else {
          dispatch(saveToken(res.data.access_token));
          localStorage?.setItem("accessToken", res.data.access_token);
          dispatch(setAuthState(true));
          localStorage.setItem("profileType", data?.loginAs);
          localStorage.setItem("access", "true");
          toast.success("Signed in Successfully");
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        setIsFormSubmitted(false);
        console.warn(err);
      });
  };

  return (
    <section className="sign-in mb-5">
      <div className="container">
        <div className="row mt-5 forpadding">
          <div className="col-md-8 mx-auto">
            <div className="card bg-tertiary">
              <div className="card-body mx-4 my-4">
                <div className="row">
                  <div className="col-md-8 mx-auto">
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <h4 className="text-center mb-3">
                        Login to your account
                      </h4>
                      {/* <p className='fw-medium fs-12 text-center'>Welcome back! Please enter your details.</p> */}
                      <div className="d-flex flex-wrap justify-content-start">
                        <p className="fw-medium fs-15 text-center me-4">
                          <Icon
                            icon="ix:user-profile"
                            width="27"
                            height="27"
                            className="text-info"
                          />{" "}
                          Login as
                        </p>
                        <div className="form-check radio me-4">
                          <input
                            {...register("loginAs")}
                            className="form-check-input"
                            type="radio"
                            name="loginAs"
                            id="TE"
                            value="TE"
                          />
                          <label className="form-check-label" htmlFor="TE">
                            TalentedXpert
                          </label>
                        </div>
                        <div className="form-check radio me-3">
                          <input
                            {...register("loginAs")}
                            className="form-check-input"
                            type="radio"
                            name="loginAs"
                            id="TR"
                            value="TR"
                          />
                          <label className="form-check-label" htmlFor="TR">
                            TalentRequestor
                          </label>
                        </div>
                        {errors.loginAs && (
                          <div className="text-danger pt-2">
                            {errors.loginAs.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email <span className="text-danger">*</span>{" "}
                        </label>
                        <input
                          {...register("email")}
                          type="email"
                          className="form-control bg-dark"
                          id="email"
                          placeholder="Enter your email"
                        ></input>
                        {errors.email && (
                          <div className="text-danger pt-2">
                            {errors.email.message}
                          </div>
                        )}
                      </div>
                      <div className="mb-3 position-relative">
                        <label htmlFor="password" className="form-label">
                          Password <span className="text-danger">*</span>{" "}
                        </label>
                        <input
                          {...register("password")}
                          type={isPasswordVisible ? "text" : "password"} // Toggle between 'text' and 'password'
                          id="password"
                          className="form-control bg-dark"
                          placeholder="Enter password"
                        />
                        <div
                          className="password-icon"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                        >
                          <Icon
                            icon={
                              isPasswordVisible
                                ? "mdi:eye-outline"
                                : "mdi:eye-off-outline"
                            }
                            className="text-placeholder"
                          />
                        </div>
                        {errors.password && (
                          <div className="text-danger pt-2">
                            {errors.password.message}
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div className="form-check">
                          <input
                            {...register("rememberMe")}
                            className="form-check-input bg-transparent border-dark"
                            type="checkbox"
                            id="rememberMe"
                          />
                          <label
                            className="form-check-label me-2"
                            htmlFor="rememberMe"
                          >
                            Remember for 30 days
                          </label>
                        </div>
                        <a className="fw-medium text-dark forget">
                          Forgot Password
                        </a>
                      </div>
                      <div className="text-end mb-3">
                        <button
                          type="submit"
                          disabled={isFormSubmitted}
                          className="btn btn-info rounded-pill signin-btn"
                        >
                          LogIn
                        </button>
                      </div>
                      <div className="text-center mb-3">
                        <Image
                          src="/assets/images/signin-line.svg"
                          alt="img"
                          className="img-fluid signin-line"
                          width={255}
                          height={255}
                          priority
                        />
                      </div>
                      <div className="d-flex justify-content-center mb-3">
                        <GoogleProvider />
                        <LinkedInBtn />
                      </div>
                      <p className=" text-center sign-in-text">
                        Dont have an account?{" "}
                        <Link
                          href="/register"
                          onClick={() => navigate("/register")}
                          className="forget text-blue fw-medium underline"
                        >
                          Register
                        </Link>
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
