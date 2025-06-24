import useSocket from "@/hooks/useSocket";
import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ImageFallback from "../ImageFallback/ImageFallback";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import NoFound from "../NoFound/NoFound";
import { setThread } from "@/reducers/ThreadSlice";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import { getTimeago } from "@/services/utils/util";
import { useNavigation } from "@/hooks/useNavigation";
import { emit } from "process";
import { Socket } from "socket.io-client";
import GlobalLoader from "../GlobalLoader/GlobalLoader";

const Notifications = () => {
  const { socket } = useSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [notification, setNotification] = useState<any>();
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const { navigate } = useNavigation();
  const notificationPanelRef = useRef<any>(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target)
      ) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const NotificationRoutes = (noti: any) => {
    if (socket && !noti?.isRead) {
      socket.emit("markNotificationAsRead", { notificationId: noti?.id });
      getNotifications();
    }
    if (noti?.type == "MESSAGE") {
      getMessageThread(noti?.metadata?.threadId, noti);
    }
    if (noti.type == "TASK") {
      navigate(`/dashboard/tasks/${noti?.metadata?.taskId}`);
    }
  };

  const getNotifications = async () => {
    try {
      const response = await apiCall(
        requests.notifications,
        {},
        "get",
        false,
        dispatch,
        user,
        router
      );
      setNotification(response?.data?.data?.notifications || []);
    } catch (error) {
      // console.warn("Error fetching tasks:", error);
    }
  };

  const getMessageThread = async (threadId: any, notificationId: any) => {
    try {
      const response = await apiCall(
        requests.getThread,
        {},
        "get",
        false,
        dispatch,
        user,
        router
      );
      const matchingThread = response?.data?.threads?.find(
        (thread: any) => thread?.id === threadId
      );
      if (matchingThread) {
        dispatch(setThread(matchingThread));
        navigate(`/dashboard/messages/${matchingThread?.id}`);
      }
    } catch (error) {
      console.warn("Error fetching threads", error);
    }
    getNotifications();
  };

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const notificationHandler = (notification: any) => {
        getNotifications();
        toast(`You have a new ${notification?.type?.toLowerCase()}`, {
          type: "info",
          autoClose: 5000,
        });
      };

      socket.on("notification", notificationHandler);

      // return () => {
      //   socket.off("notification", notificationHandler);
      // };
    }
  }, [socket]);

  const unreadCount =
    notification?.filter((noti: any) => !noti.isRead)?.length || 0;

  return (
    <div className="d-none d-lg-block noti-bell mt-3 position-relative">
      <button
        className="btn"
        type="button"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        <Icon
          icon="iconamoon:notification-fill"
          className="text-dark ms-2 mb-2"
          width="24"
          height="24"
        />
        {unreadCount > 0 && (
          <span className="noti-msg-count translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {isPanelOpen && (
        <div
          className="dropdown-menu dropfix show"
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-10%)",
            marginTop: "10px",
            zIndex: 1000,
          }}
          ref={notificationPanelRef}
        >
          <div className="notification-container">
            <div className="notifi-header">
              <a className="dropdown-item" href="#">
                Notifications
              </a>
            </div>
            {notification?.length > 0 ? (
              notification?.map((noti: any) => (
                <li
                  className="group notifi-main d-flex justify-content-between mx-3"
                  key={noti?.id}
                  onClick={() => {
                    NotificationRoutes(noti);
                    setIsPanelOpen(false);
                  }}
                  style={{
                    padding: "5px",
                    cursor: "pointer",
                    backgroundColor: noti?.isRead ? "#ffffff" : "#f0f8ff",
                    borderLeft: noti?.isRead ? "none" : "4px solid #007bff",
                  }}
                >
                  <div className="d-flex cursor">
                    <div className="avatar">
                      <ImageFallback
                        src={
                          noti?.senderProfile?.user?.profilePicture?.fileUrl ||
                          defaultUserImg
                        }
                        alt="img"
                        className="user-img img-round"
                        width={40}
                        height={40}
                        priority
                        userName={
                          noti?.senderProfile?.user
                            ? `${noti?.senderProfile?.user?.firstName} ${noti?.senderProfile?.user?.lastName}`
                            : null
                        }
                      />
                    </div>
                    <div className="namedescription m-0 ms-3">
                      <p className="GroupName">
                        {noti?.senderProfile?.user?.firstName}{" "}
                        {noti?.senderProfile?.user?.lastName}
                      </p>
                      <div className="d-flex">
                        <p className="GroupDescrp fs-12">{noti?.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="progres text-end">
                    <p className="GroupDescrp fs-10">
                      {getTimeago(noti?.createdAt)}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <NoFound message={"No notifications available"} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
