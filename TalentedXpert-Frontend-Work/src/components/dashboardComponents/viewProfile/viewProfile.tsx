"use client";
import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ProjectsSlider from "@/components/common/sliders/ProjectsSlider";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import Review from "@/components/common/Review/Review";
import RatingStar from "@/components/common/RatingStar/RatingStar";
import ListCards from "../Articles/ListCards";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import { dynamicBlurDataUrl } from "@/services/utils/dynamicBlurImage";
import { useNavigation } from "@/hooks/useNavigation";
import { getTimeago } from "@/services/utils/util";

const ViewProfile: FC<any> = () => {
  const [details, setDetails] = useState<any>({});
  const [earnedOrSpent, setEarnedOrSpent] = useState<any>([]);
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState("");
  const { navigate } = useNavigation();

  const dispatch = useAppDispatch();
  // const user = useSelector((state: RootState) => state.user)
  const router = useRouter();
  const { userType, id } = useParams();

  const getUser = async (id: number) => {
    await apiCall(
      requests.getUserInfo + id,
      {},
      "get",
      false,
      dispatch,
      {},
      router
    )
      .then((res: any) => {
        setDetails({
          ...res?.data,
          profile: res?.data?.profile?.filter((prof: any) =>
            userType === "talent-requestors"
              ? prof?.type === "TR"
              : prof?.type === "TE"
          ),
        });
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    if (id) {
      getUser(Number(id));
      getSpendingsOrEarnings()
      console.log('dsfas')
    }
  }, [id]);

  useEffect(() => {
    if (details?.profilePicture?.fileUrl) {
      fetchBlurDataURL();
    }
  }, [details?.profilePicture?.fileUrl]);

  const fetchBlurDataURL = async () => {
    if (details?.profilePicture?.fileUrl) {
      const blurUrl = await dynamicBlurDataUrl(
        details?.profilePicture?.fileUrl
      );
      setProfileImageBlurDataURL(blurUrl);
    }
  };

  const formatedDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getSpendingsOrEarnings = async () => {
     console.log('dsfasddddddddddddddddd')
   
    try {
      const response = await apiCall(
        userType === "talent-requestors"?
        requests?.spendings:requests.earnings,
        {},
        "get",
        false,
        dispatch,
        {},
        router
      );
      console.log('res money',response)
      setEarnedOrSpent(response.data)
    } catch (error) {
      console.warn("Error fetching articles:", error);
    }
  };

  const calculateTaskSuccess = () => {
    if (details?.profile?.length > 0) {
      const successRate = (details?.profile[0]?.averageRating / 5) * 100;
      return successRate;
    }
  };

  return (
    <>
      <div className="card">
        <div className="card  card-header bg-gray">
          <h3 className="text-white">View Profile</h3>
        </div>
        {details?.profile?.length > 0 ? (
          <div className="bg-black p-3">
            <div className=" my-active-task py-2 bg-gray b-r">
              <div className="profile-header d-md-flex justify-content-between mx-md-5 p-4">
                <div className="profile-left d-flex w-50">
                  <div className="me-4">
                    <ImageFallback
                      src={details?.profilePicture?.fileUrl}
                      fallbackSrc={defaultUserImg}
                      alt="img"
                      className="user-img img-round mb-3"
                      width={100}
                      height={100}
                      loading="lazy"
                      blurDataURL={profileImageBlurDataURL}
                      userName={
                        details
                          ? `${details?.firstName} ${details?.lastName}`
                          : null
                      }
                    />
                  </div>
                  <div className="profile-detail">
                    <h5 className="mt-3">
                      <b>
                        {details?.firstName} {details?.lastName}
                      </b>
                    </h5>
                    <p>{details?.title}</p>
                    <div className="star d-flex align-items-center">
                      {details?.profile?.length > 0 && (
                        <>
                          <RatingStar
                            rating={details?.profile[0]?.averageRating}
                          />
                          <span className="ms-1">{`(${details?.profile[0]?.averageRating})`}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="profile-right ">
                  <div className="d-flex align-items-center mt-3">
                    <Image
                      src="/assets/images/success.svg"
                      alt="img"
                      className="me-2"
                      width={25}
                      height={25}
                      priority
                    />
                    <p className="m-0">
                      {calculateTaskSuccess()}% Task Success
                    </p>
                  </div>
                  <p className="m-0">
                    {/* <strong>$50K+</strong>{" "} */}
                    {userType === "talent-requestors" ? earnedOrSpent.totalSpent +" Spent" : earnedOrSpent.totalEarned + " Earned "}
                  </p>
                  {details?.profile?.length > 0 && (
                    <p className="m-0">
                      {" "}
                      <strong>
                        {details?.profile[0]?.completedTasks
                          ? details?.profile[0]?.completedTasks?.length
                          : "No"}
                      </strong>{" "}
                      Completed Tasks
                    </p>
                  )}
                </div>
              </div>
              <div className="about mx-2 mx-md-4 p-3">
                <h4 className="pb-2 border-bottom">About</h4>
                <HtmlData data={details?.about} className="text-white" />
              </div>
              {userType == "talent-requestors" ? (
                ""
              ) : (
                <>
                  <div className="about  mx-2 mx-md-4 p-3 my-3">
                    <h4 className="pb-2 border-bottom">Education</h4>
                    {details?.education?.length > 0 ? (
                      details?.education?.map((edu: any, index: number) => (
                        <div key={index}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="fw-bold mb-2">{edu?.institution}</p>
                              <p className="mb-0">{edu?.degree}</p>
                            </div>
                            <p className="mb-0">{formatedDate(edu?.date)}</p>
                          </div>
                          {index !== details.education.length - 1 && (
                            <hr
                              className="mt-2"
                              style={{ borderColor: "#ccc", opacity: 0.7 }}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center mb-0">No Education found yet</p>
                    )}
                  </div>

                  <div className="about  mx-2 mx-md-4 p-3">
                    <h4 className="pb-2 border-bottom">Experience</h4>
                    {details?.experience?.length > 0 ? (
                      details?.experience?.map((exp: any, index: number) => (
                        <div key={index}>
                          <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div className="d-flex justify-content-between w-100">
                              <p className="fw-bold mb-0">{exp?.role}</p>
                              <p className=" mb-0">
                                {formatedDate(exp?.startDate)} -
                                {exp?.isPresent
                                  ? "On going"
                                  : formatedDate(exp?.endDate)}
                              </p>
                            </div>

                            <p className="mb-2">{exp?.companyName}</p>
                          </div>
                          <p className="mb-2">{exp?.description}</p>
                          {index !== details.experience.length - 1 && (
                            <hr
                              className="mt-2"
                              style={{ borderColor: "#ccc", opacity: 0.7 }}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center mb-0">
                        No Experience found yet
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="about  mx-2 mx-md-4 p-3 my-3">
                <h4 className="pb-2 border-bottom">Reviews</h4>
                {details?.profile?.length > 0 &&
                  details?.profile[0]?.reviewsReceived?.length > 0 ? (
                  <>
                    {details.profile[0]?.reviewsReceived
                      ?.slice(0, 3)
                      .map((review: any) => {
                        return (
                          <Review reviewReceive={review} key={review?.id} />
                        );
                      })}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                      }}
                    >
                      <Link
                        className="btn rounded-pill btn-outline-info ms-4 ls"
                        href={`/${userType}/${id}/allReviews`}
                      >
                        View All
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="text-center mb-0">No Reviews found yet</p>
                )}
              </div>
              {details?.profile?.length > 0 &&
                details?.profile[0]?.completedTasks?.length > 0 && (
                  <div className="Projects p-lg-4 p-md-4 p-sm-2  p-3 m-4">
                    <h3 className="my-3 ms-2">Tasks</h3>
                    <ProjectsSlider task={details?.profile[0].completedTasks} />
                    <div className="text-end mt-3">
                      <Link
                        className="btn rounded-pill btn-outline-info ms-4 ls"
                        href={`/${userType}/${id}/completedTasks`}
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                )}
              {userType !== "talent-requestors" ? (
                <div className="articles  p-3">
                  <h3 className="my-2 ms-2">Articles</h3>
                  <div className="d-flex justify-content-between  flex-column">
                    {details?.profile[0]?.articles.length > 0 && (
                      details?.profile[0]?.articles.slice(0, 3).map((art: any, index: number) => (
                        <div key={index} className="articles-card promoted_card me-2 mt-2">
                          <h4>{art.title}</h4>
                          <span>{getTimeago(art.createdAt)}</span>
                          <p className="line-clamp-2">
                            <HtmlData data={art.description} />
                          </p>
                        </div>
                      ))
                    )}


                  </div>
                  <div className="text-end mt-3">
                    {/* <Link className="btn rounded-pill btn-outline-info mt-2" href={'/dashboard/talentxpertEX/Articlelist'} onClick={()=>navigate('/dashboard/talentxpertEX/Articlelist')} >View All<Icon icon="ic:sharp-arrow-forward" className='ms-2' /></Link> */}
                    <Link
                      className="btn rounded-pill btn-outline-info mt-2"
                      href={`/articles/${id}/completedTasks`}
                    >
                      View All
                      <Icon icon="ic:sharp-arrow-forward" className="ms-2" />
                    </Link>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ViewProfile;
