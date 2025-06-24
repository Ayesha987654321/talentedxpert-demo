"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/Store";
import { RootState } from "@/reducers/Reducer";
import { clearToken, saveToken, setAuthState } from "@/reducers/AuthSlice";
import { setUser } from "@/reducers/UserSlice";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import { dynamicBlurDataUrl } from "@/services/utils/dynamicBlurImage";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { setThread } from "@/reducers/ThreadSlice";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import RatingStar from "@/components/common/RatingStar/RatingStar";
import { toast } from "react-toastify";
import { useNavigation } from "@/hooks/useNavigation";
import { setLoadingState } from "@/reducers/LoadingSlice";

const Sidebar = () => {
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { navigate } = useNavigation();

  const isActive = useCallback(
    (path: string, exact: boolean = false) => {
      if (exact) {
        return pathname === path;
      }
      return pathname?.startsWith(path);
    },
    [pathname]
  );

  useEffect(() => {
    if (user?.profilePicture?.fileUrl) {
      fetchBlurDataURL();
    }
  }, [user?.profilePicture?.fileUrl]);

  const fetchBlurDataURL = async () => {
    if (user?.profilePicture?.fileUrl) {
      const blurUrl = await dynamicBlurDataUrl(user?.profilePicture?.fileUrl);
      setProfileImageBlurDataURL(blurUrl);
    }
  };

  const handleLogout = () => {
    dispatch(saveToken(null));
    dispatch(setAuthState(false));
    dispatch(setThread(null));
    dispatch(clearToken());
    dispatch(setUser(null));
    localStorage.clear();
    navigate("/");
  };

  const handleSwitch = () => {
    dispatch(setThread(null));
    pathname === "/dashboard" && dispatch(setLoadingState(true));
    const type = localStorage.getItem("profileType");
    type === "TR"
      ? localStorage.setItem("profileType", "TE")
      : localStorage.setItem("profileType", "TR");
    getUserDetails();
    pathname === "/dashboard"
      ? dispatch(setLoadingState(false))
      : navigate("/dashboard");
  };

  const createOtherAccount = async () => {
    const type = localStorage.getItem("profileType");

    if (
      (user?.education?.length < 1 ||
        user?.experience?.length < 1 ||
        user?.skills.length < 0) &&
      type == "TR"
    ) {
      toast.info(
        "You need to add your Education, Experience and Skills to become an Expert"
      );
      router.push("/dashboard/profile-setting");
      return;
    }
    await apiCall(
      requests.editUser + user?.id,
      { profileType: "BOTH" },
      "put",
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
        } else {
          handleSwitch();
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const getInitials = (first: string, last?: string) => {
    return `${first.charAt(0)}${last ? last.charAt(0) : ""}`.toUpperCase();
  };

  const getUserDetails = async () => {
    await apiCall(
      requests.getUserInfo,
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
          dispatch(setUser(res?.data));
        }
      })
      .catch((err) => console.warn(err));
  };

  return (
    <div className="col-auto p-0 p-lg-2">
      <div
        className="offcanvas-lg offcanvas-start sidebar-offcanvas"
        tabIndex={-1}
        id="offcanvasResponsive"
        aria-labelledby="offcanvasResponsiveLabel"
      >
        <div className="offcanvas-header">
          <button
            type="button"
            className="btn-close bg-light"
            data-bs-dismiss="offcanvas"
            data-bs-target="#offcanvasResponsive"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body px-0 py-0">
          <div className="sidebar">
            <div className="text-center py-4">
              <Link
                className="text-lg-end card-profile  mt-4 "
                href={`/dashboard/${
                  user?.profile[0]?.type === "TR"
                    ? "talent-requestors"
                    : "talented-xperts"
                }/${user?.id}`}
                onClick={() =>
                  navigate(
                    `/dashboard/${
                      user?.profile[0]?.type === "TR"
                        ? "talent-requestors"
                        : "talented-xperts"
                    }/${user?.id}`
                  )
                }
              >
                <ImageFallback
                  src={user?.profilePicture?.fileUrl}
                  // fallbackSrc={defaultUserImg}
                  className=" user-img img-round"
                  width={90}
                  height={90}
                  alt="img"
                  loading="lazy"
                  blurDataURL={profileImageBlurDataURL}
                  userName={
                    user ? `${user?.firstName} ${user?.lastName}` : null
                  }
                />
              </Link>
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>
              {user?.profile?.length > 0 && user?.profile[0]?.type === "TR" ? (
                <p>I am TalentRequestor</p>
              ) : (
                <p>I am TalentedXpert</p>
              )}
              {user?.profile?.length > 0 && (
                <RatingStar rating={user.profile[0].averageRating} />
              )}
            </div>
            <div className="form-switch-button text-center mb-3">
              <button
                className="btn btn-sm w-s rounded-pill btn-outline-info"
                onClick={() =>
                  user?.profileType === "BOTH"
                    ? handleSwitch()
                    : createOtherAccount()
                }
              >
                {user?.profileType === "BOTH"
                  ? "Switch Profile"
                  : user?.profileType === "TE"
                  ? "Create a TalentRequestor Profile"
                  : "Create a TalentedXpert Profile"}
              </button>
            </div>
            <div className="sidebar-link">
              <ul>
                <Link href="/dashboard" onClick={() => navigate("/dashboard")}>
                  <li
                    className={
                      isActive("/dashboard", true)
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Home
                  </li>
                </Link>
                <Link
                  href="/dashboard/tasks"
                  onClick={() => navigate("/dashboard/tasks")}
                >
                  <li
                    className={
                      isActive("/dashboard/tasks")
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Tasks
                  </li>
                </Link>
                {user?.profile?.length > 0 &&
                user?.profile[0]?.type === "TR" ? (
                  <Link
                    href="/dashboard/talented-xperts"
                    onClick={() => navigate("/dashboard/talented-xperts")}
                  >
                    <li
                      className={
                        isActive("/dashboard/talented-xperts")
                          ? "text-dark bg-primary"
                          : "text-white"
                      }
                    >
                      TalentedXperts
                    </li>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard/talent-requestors"
                      onClick={() => navigate("/dashboard/talent-requestors")}
                    >
                      <li
                        className={
                          isActive("/dashboard/talent-requestors")
                            ? "text-dark bg-primary"
                            : "text-white"
                        }
                      >
                        TalentRequestors
                      </li>
                    </Link>
                    <Link
                      href="/dashboard/articles"
                      onClick={() => navigate("/dashboard/articles")}
                    >
                      <li
                        className={
                          isActive("/dashboard/articles")
                            ? "text-dark bg-primary"
                            : "text-white"
                        }
                      >
                        Articles
                      </li>
                    </Link>
                  </>
                )}
                <Link
                  href="/dashboard/messages"
                  onClick={() => navigate("/dashboard/messages")}
                >
                  <li
                    className={
                      isActive("/dashboard/messages")
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Messages
                  </li>
                </Link>

                {user?.profile?.length > 0 && (
                  <Link
                    href="/dashboard/payments/information"
                    onClick={() => navigate("/dashboard/payments/information")}
                  >
                    <li
                      className={
                        isActive("/dashboard/payments/information")
                          ? "text-dark bg-primary"
                          : "text-white w-s"
                      }
                    >
                      Payment Information
                    </li>
                  </Link>
                )}
                <Link
                  href="/dashboard/payments"
                  onClick={() => navigate("/dashboard/payments")}
                >
                  <li
                    className={
                      isActive("/dashboard/payments", true)
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Transactions
                  </li>
                </Link>
                <Link
                  href="/dashboard/disputes"
                  onClick={() => navigate("/dashboard/disputes")}
                >
                  <li
                    className={
                      isActive("/dashboard/disputes")
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Disputes
                  </li>
                </Link>
                {user?.profile?.length > 0 &&
                  user?.profile[0]?.type === "TE" && (
                    <Link
                      href="/dashboard/teams"
                      onClick={() => navigate("/dashboard/teams")}
                    >
                      <li
                        className={
                          isActive("/dashboard/teams")
                            ? "text-dark bg-primary"
                            : "text-white w-s"
                        }
                      >
                        Teams
                      </li>
                    </Link>
                  )}
                <Link
                  href="/dashboard/profile-setting"
                  onClick={() => navigate("/dashboard/profile-setting")}
                >
                  <li
                    className={
                      isActive("/dashboard/profile-setting")
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Settings
                  </li>
                </Link>
                {/* {user?.profile?.length > 0 && user?.profile[0]?.type !== 'TR' && ( */}
                <Link
                  href="/dashboard/reviews"
                  onClick={() => navigate("/dashboard/reviews")}
                >
                  <li
                    className={
                      isActive("/dashboard/reviews")
                        ? "text-dark bg-primary"
                        : "text-white"
                    }
                  >
                    Reviews
                  </li>
                </Link>
                {/* )} */}
                <li onClick={handleLogout}>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
