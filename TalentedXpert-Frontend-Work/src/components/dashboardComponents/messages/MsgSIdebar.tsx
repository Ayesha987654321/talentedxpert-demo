"use client";
import React, { useEffect, useState } from "react";
import ImageFallback from "../../common/ImageFallback/ImageFallback";
import { Icon } from "@iconify/react/dist/iconify.js";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { setThread } from "@/reducers/ThreadSlice";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import NoFound from "@/components/common/NoFound/NoFound";
import Image from "next/image";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import defaultUserImg from "../../../../public/assets/images/default-user.jpg";
import useSocket from "@/hooks/useSocket";
import insurance from "../../../../public/insurance.png";
const MsgSidebar = ({ setLoadingChat, getThreads, threads }: any) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const thread = useSelector((state: RootState) => state.thread);
  // const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (thread) {
      setActiveThread(thread?.id);
    } else {
      setActiveThread(threads[0]?.id);
      dispatch(setThread(threads[0]));
    }
  }, [thread, threads]);

  useEffect(() => {
    if (socket) {
      const notificationHandler = (notification: any) => {
        getThreads();
      };

      socket.on("notification", notificationHandler);

      // return () => {
      //   socket.off("notification", notificationHandler);
      // };
    }
  }, [socket]);

  useEffect(() => {
    getThreads();
  }, []);

  const handleThreadClick = (thread: any) => {
    dispatch(setThread(thread));
    setActiveThread(thread?.id);
    setLoadingChat(true);
    setTimeout(() => {
      setLoadingChat(false);
    }, 1200);
  };

  return (
    <div
      className="card bg-gray mt-1 ms-3 p-3 chat-left-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div className="searchBar">
          <form className="search-container">
            <input
              type="text"
              className="text-light"
              id="search-bar"
              placeholder="Search here"
            />
            <Icon className="search-icon" icon="clarity:search-line" />
          </form>
        </div>
        <div className="chat-member">
          <ul>
            {threads.length > 0 ? (
              threads.map((thread: any) => {
                const isActive = thread?.id === activeThread;
                return (
                  <li
                    className={`chat-list group d-flex bordr ${
                      isActive ? "active" : ""
                    }`}
                    key={thread?.id}
                    onClick={() => handleThreadClick(thread)}
                  >
                    <div className="avatar">
                      <ImageFallback
                        src={
                          thread?.expertProfile?.userId === user?.id
                            ? thread?.task?.requesterProfile?.user
                                ?.profilePicture?.fileUrl
                            : thread?.expertProfile?.user?.profilePicture
                                ?.fileUrl
                        }
                        fallbackSrc={defaultUserImg}
                        alt="img"
                        className="user-img img-round"
                        width={40}
                        height={40}
                        userName={
                          thread?.expertProfile?.userId === user?.id
                            ? `${thread?.task?.requesterProfile?.user?.firstName} ${thread?.task?.requesterProfile?.user?.lastName}`
                            : `${thread?.expertProfile?.user?.firstName} ${thread?.expertProfile?.user?.lastName}`
                        }
                      />
                    </div>
                    <div className="namedescription">
                      <HtmlData
                        data={
                          thread?.expertProfile?.userId === user?.id
                            ? `${thread?.task?.requesterProfile?.user?.firstName} ${thread?.task?.requesterProfile?.user?.lastName}`
                            : `${thread?.expertProfile?.user?.firstName} ${thread?.expertProfile?.user?.lastName}`
                        }
                        className="GroupName text-white"
                      />
                      <p className="GroupDescrp text-white">
                        {thread?.task?.name}
                      </p>
                    </div>
                    <div className="progres">
                      <p className="w-s mt-2">{thread?.task?.status}</p>
                    </div>
                  </li>
                );
              })
            ) : (
              <NoFound />
            )}
          </ul>
        </div>
      </div>
      <div
        className="text-center mt-3 text-white border border-1 rounded p-2"
        style={{
          fontWeight: "lighter",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "row", // Ensure the icon and text are in a row
          alignItems: "center", // Center them vertically
          justifyContent: "center", // Center them horizontally
          gap: "10px", // Space between the icon and the text
        }}
      >
        <Icon
          style={{
            color: "white", // or 'black' depending on background
            fontSize: "30px",
          }}
          icon="mdi:shield-check-outline"
          className="me-2 text-white"
          width="40"
          height="30"
        />
        <p
          style={{
            color: "white",
            fontSize: "12px",
            textAlign: "left",
            margin: "0",
          }}
        >
          The messages are monitored by admin for full transparency and privacy
          purposes
        </p>
      </div>
    </div>
  );
};

export default MsgSidebar;
