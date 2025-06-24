"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { useNavigation } from "@/hooks/useNavigation";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/Store";
// import TaskCard from "../tasks/TaskCard";
import NoFound from "@/components/common/NoFound/NoFound";
import Review from "@/components/common/Review/Review";

const AllUserReviews = () => {
    const { userType, id } = useParams();
    const [details, setDetails] = useState<any>({});
    const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState("");
    const { navigate } = useNavigation();

    const dispatch = useAppDispatch();
    // const user = useSelector((state: RootState) => state.user)
    const router = useRouter();

    console.log("userr", userType, id);

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
                console.log("res", res);
                setDetails({
                    //   completedTasks: res?.data?.profile?.filter((prof: any) =>
                    //     userType === "talent-requestors"
                    //       ? prof?.type === "TR"
                    //       : prof?.type === "TE"
                    //   )?.[0]?.completedTasks,
                    recievedreviews: res?.data?.profile?.filter((prof: any) =>
                        userType === "talent-requestors"
                            ? prof?.type === "TR"
                            : prof?.type === "TE"
                    )?.[0]?.reviewsReceived,
                });
            })
            .catch((err) => console.warn(err));
    };
    console.log("pp", details);

    useEffect(() => {
        if (id) {
            getUser(Number(id));
        }
    }, [id]);
    return (
        <div>
            <div className={"card forpadding"}>
                <div className=" tab-card first-card card-header  ">
                    <div className="card-bodyy p-2">
                        <div className="filtersearch d-flex align-items-center justify-content-between flex-wrap p-2">
                            <div className="card-left-heading">
                                <h3>Reviews </h3>
                            </div>
                        </div>
                    </div>

                    <div className="tab-content" id="pills-tabContent">
                        {
                            <div
                                className="tab-pane fade show active"
                                id="pills-home"
                                role="tabpanel"
                                aria-labelledby="pills-home-tab"
                                tabIndex={0}
                            >
                                {details && details?.recievedreviews?.length > 0 ? (
                                    details.recievedreviews?.map((review: any) => (
                                        <Review reviewReceive={review} key={review?.id} />
                                    ))
                                ) : (
                                    <NoFound message={"No Task Found"} />
                                )}
                            </div>
                        }
                    </div>

                    <div className="card-right-heading d-flex justify-content-between"></div>
                </div>

                {/* 
                <div className='pagiandnumber d-flex flex-wrap justify-content-around justify-content-md-between align-items-baseline py-2 px-lg-5 px-2 bg-black'>
                    <div className='Numbring d-flex align-items-center'>
                        <span>Show</span>
                        <select className="form-select form-select-sm mx-3" aria-label=".form-select-sm example">
                            <option selected>3</option>
                            <option value="1">5</option>
                            <option value="2">20</option>
                            <option value="3">50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className='pagination'>
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                <li className="page-item">
                                    <a className="page-link" href="#" aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <li className="page-item active"><a className="page-link" href="#">1</a></li>
                                <li className="page-item"><a className="page-link" href="#">2</a></li>
                                <li className="page-item"><a className="page-link" href="#">3</a></li>
                                <li className="page-item">
                                    <a className="page-link" href="#" aria-label="Next">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default AllUserReviews