
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter, useSearchParams } from "next/navigation";
import MsgSidebar from "./MsgSIdebar";
import Link from "next/link";
import ImageFallback from "@/components/common/ImageFallback/ImageFallback";
import { dynamicBlurDataUrl } from "@/services/utils/dynamicBlurImage";
import defaultImg from "../../../../public/assets/images/localhost-file-not-found-480x480.avif";
import dynamic from "next/dynamic";
import ChatFooter from "./ChatFooter";
import GlobalLoader from "@/components/common/GlobalLoader/GlobalLoader";
import useSocket from "@/hooks/useSocket";
import { handleDownloadFile, getFileType } from "@/services/utils/util";

const ChatHeader = dynamic(() => import("./ChatHeader"), { ssr: false });

// TypeScript interfaces
interface Thread {
  id: number;
  expertProfile?: { id: number; userId: number; user?: { firstName: string; lastName: string; profilePicture?: { fileUrl: string } } };
  task?: { requesterProfileId: number; requesterProfile?: { user?: { profilePicture?: { fileUrl: string } } } };
}

interface Message {
  id: string | number;
  senderProfileId: number;
  text?: string;
  documents?: Document[];
  createdAt: string;
  metadata?: any;
  senderUser?: any;
}

interface Document {
  key: string;
  fileUrl: string;
  presignedUrl?: string;
}

interface MsgSidebarProps {
  setLoadingChat: React.Dispatch<React.SetStateAction<boolean>>;
  getThreads: () => Promise<void>;
  threads: Thread[];
}

interface ChatFooterProps {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  toSend: string;
  setToSend: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => Promise<void>;
}

const Message = () => {
  const [profileImageBlurDataURL, setProfileImageBlurDataURL] = useState<string>("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [toSend, setToSend] = useState<string>("");
  const [sendChat, setSendChat] = useState<boolean>(false);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [chat, setChat] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messageLimit, setMessageLimit] = useState<number>(10);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageSenderRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.user);
  const thread = useSelector((state: RootState) => state.thread) as Thread | undefined;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { socket } = useSocket();

  const receiverId =
    user?.profile?.[0]?.type === "TR"
      ? thread?.expertProfile?.id
      : thread?.task?.requesterProfileId;

  // Fetch blur data URL for profile image
  useEffect(() => {
    const fetchBlurDataURL = async () => {
      if (user?.profilePicture?.fileUrl) {
        try {
          const blurUrl = await dynamicBlurDataUrl(user.profilePicture.fileUrl);
          setProfileImageBlurDataURL(blurUrl);
        } catch (error) {
          console.warn("Error fetching blur data URL:", error);
        }
      }
    };
    fetchBlurDataURL();
  }, [user?.profilePicture?.fileUrl]);

  // Fetch threads
  const getThreads = useCallback(async () => {
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
      setThreads((response?.data?.threads || []) as Thread[]);
    } catch (error) {
      console.warn("Error fetching threads:", error);
    }
  }, [dispatch, user, router]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!thread?.id) {
      setChat([]);
      setSendChat(false);
      return;
    }
    setLoadingChat(true);
    try {
      const response = await apiCall(
        requests.getMsg,
        { threadId: Number(thread.id), limit: messageLimit },
        "get",
        true,
        dispatch,
        user,
        router
      );
      const orderedMessages = (response?.data?.data?.reverse() || []) as Message[];
      for (const message of orderedMessages) {
        if (message.documents) {
          for (const document of message.documents) {
            if (getFileType(document.key) === "image") {
              try {
                const res = await apiCall(
                  `${requests.downloadFile}?fileUrl=${document.fileUrl}`,
                  {},
                  "get",
                  false,
                  dispatch,
                  user,
                  router
                );
                if (res?.data?.presignedUrl) {
                  document.presignedUrl = res.data.presignedUrl;
                }
              } catch (err) {
                console.warn("Error fetching presigned URL:", err);
              }
            }
          }
        }
      }
      setChat(orderedMessages);
      setSendChat(true);
      lastMessageSenderRef.current = orderedMessages.length
        ? orderedMessages[orderedMessages.length - 1].senderProfileId
        : null;
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChat([]);
    } finally {
      setLoadingChat(false);
    }
  }, [thread?.id, messageLimit, dispatch, user, router]);

  // Download private file
  const getPrivateFile = useCallback(
    async (fileUrl: string, key: string) => {
      if (!fileUrl || !key) {
        console.warn("Invalid fileUrl or key for download");
        return;
      }
      try {
        const res = await apiCall(
          `${requests.downloadFile}?fileUrl=${fileUrl}`,
          {},
          "get",
          false,
          dispatch,
          user,
          router
        );
        if (res?.data?.presignedUrl) {
          handleDownloadFile(res.data.presignedUrl, key);
        }
      } catch (err) {
        console.warn("Error downloading file:", err);
      }
    },
    [dispatch, user, router]
  );

  // Handle sending a message
  const handleSend = useCallback(async () => {
    if (!toSend && documents.length === 0) return;
    if (!thread?.id || !user?.profile?.[0]?.id) return;
    const data = {
      senderProfileId: Number(user.profile[0].id),
      receiverProfileId: Number(receiverId),
      text: toSend,
      threadId: Number(thread.id),
      documents,
      messageType: "USER"
    };
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`, // Unique temp ID
      senderProfileId: Number(user.profile[0].id),
      text: toSend,
      documents: documents.map((doc) => ({ ...doc, presignedUrl: undefined })), // No presignedUrl yet
      createdAt: new Date().toISOString(),
    };
    try {
      setChat((prev) => [...prev, optimisticMessage]);
      setToSend("");
      setDocuments([]);
      setIsAtBottom(true);
      if (!socket?.connected) {
        console.warn("Socket not connected, attempting to reconnect...");
        await new Promise((resolve: any) => socket?.once("connect", resolve));
      }
      socket?.emit("newMessage", data);
      await getThreads();
    } catch (error) {
      console.warn("Error sending message:", error);
      setChat((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    }
  }, [toSend, documents, user?.profile, receiverId, thread?.id, socket, getThreads]);

  // Handle scroll with debouncing
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 20);
        if (scrollTop === 0 && !loadingChat) {
          setMessageLimit((prev) => prev + 10);
        }
      }
    }, 100);
  }, [loadingChat]);

  // Socket event listener
  useEffect(() => {
    if (!socket || !thread?.id) return;
    const messageHandler = (message: Message) => {
      console.log("Received message:", message);
      if (message.senderProfileId !== user?.profile?.[0]?.id) {
        fetchMessages(); // Only fetch for non-user messages
      }
      if (message?.metadata?.threadId !== thread.id) {
        getThreads();
      }
    };
    socket.on("message", messageHandler);
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off("message", messageHandler);
    };
  }, [socket, thread?.id, user?.profile, fetchMessages, getThreads]);

  // Fetch messages on mount or when thread/messageLimit changes
  useEffect(() => {
    if (isAuth && thread?.id) {
      fetchMessages();
    }
  }, [isAuth, thread?.id, messageLimit, fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current && chat.length > 0 && (isAtBottom || lastMessageSenderRef.current === user?.profile?.[0]?.id)) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isAtBottom, user?.profile]);

  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      setIsAtBottom(
        chatContainer.scrollTop + chatContainer.clientHeight >=
        chatContainer.scrollHeight - 20
      );
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Handle Enter key for sending messages
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Message rendering component
  const MessageItem = ({ message }: { message: Message }) => {
    const isSender = message.senderProfileId === user?.profile?.[0]?.id;
    return (
      <div style={{ paddingRight: "10px" }} key={message.id} className="row">
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: isSender ? "flex-end" : "flex-start",
          }}
          className={isSender ? "col-6 ms-auto" : "col-6"}
        >
          <div style={{ width: "80%" }} className={isSender ? "answer" : "question"}>
            {message.documents?.map((doc, idx) => {
              const fileType = getFileType(doc.key);
              return (
                <div
                  className={`${fileType !== "image" && "text"} mb-3`}
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                    padding: "5px",
                    cursor: fileType !== "text" ? "pointer" : "default",
                  }}
                  onClick={fileType !== "image" ? () => getPrivateFile(doc.fileUrl, doc.key) : undefined}
                >
                  {!isSender && (
                    <div className="avatar me-2">
                      <ImageFallback
                        src={
                          message?.senderUser ?
                            message?.senderUser?.profilePicture?.fileUrl
                            : thread?.expertProfile?.userId === user?.id
                              ? thread?.task?.requesterProfile?.user?.profilePicture?.fileUrl
                              : thread?.expertProfile?.user?.profilePicture?.fileUrl
                        }
                        alt="img"
                        className="user-img img-round"
                        width={40}
                        height={40}
                        userName={
                          message?.senderUser ?
                            `${message?.senderUser?.firstName} ${message?.senderUser?.lastName}`
                            : thread?.expertProfile?.user
                              ? `${thread.expertProfile.user.firstName} ${thread.expertProfile.user.lastName}`
                              : undefined
                        }
                      />
                    </div>
                  )}
                  {fileType === "image" && doc.presignedUrl ? (
                    <Link href={doc.presignedUrl} target="_blank" rel="noopener noreferrer">
                      <ImageFallback
                        src={doc.presignedUrl}
                        fallbackSrc={defaultImg}
                        alt="img"
                        className="img-fluid"
                        width={255}
                        height={255}
                        loading="lazy"
                        blurDataURL={profileImageBlurDataURL}
                      />
                    </Link>
                  ) : (
                    <div style={{ width: "fit-content" }} className="text-dark">
                      <Icon icon={fileType} width={48} height={48} className="me-2 text-dark" />
                      {doc.key}
                    </div>
                  )}
                </div>
              );
            })}
            {message.text && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: isSender ? "flex-end" : "flex-start",
                }}
              >
                {!isSender && (
                  <div className="avatar me-2">
                    <ImageFallback
                      src={
                        message?.senderUser ?
                          message?.senderUser?.profilePicture?.fileUrl
                          : thread?.expertProfile?.userId === user?.id
                            ? thread?.task?.requesterProfile?.user?.profilePicture?.fileUrl
                            : thread?.expertProfile?.user?.profilePicture?.fileUrl
                      }
                      alt="img"
                      className="user-img img-round"
                      width={40}
                      height={40}
                      userName={
                        message?.senderUser ?
                          `${message?.senderUser?.firstName} ${message?.senderUser?.lastName}`
                          :
                          thread?.expertProfile?.user
                            ? `${thread.expertProfile.user.firstName} ${thread.expertProfile.user.lastName}`
                            : undefined
                      }
                    />
                  </div>
                )}
                <div style={{ maxWidth: "80%" }} className="text">
                  <p style={{ width: "100%" }}>{message.text}</p>
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                padding: "5px",
              }}
            >
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card first-card card-header">
        <h3 className="ms-5">Messages</h3>
      </div>
      <div className="card-bodyy my-active-task py-2 position-relative">
        <div className="row">
          <div className="col-md-4">
            <MsgSidebar
              setLoadingChat={setLoadingChat}
              getThreads={getThreads}
              threads={threads}
            />
          </div>
          <div className="col-md-8">
            {sendChat && thread?.id ? (
              <div className="card bg-gray mt-1 me-3 px-3 msg-main">
                <ChatHeader user={user} thread={thread} />
                <div
                  className="msg-body right-message"
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                  ref={chatContainerRef}
                >
                  {loadingChat ? (
                    <GlobalLoader />
                  ) : chat.length > 0 ? (
                    chat.map((message) => <MessageItem key={message.id} message={message} />)
                  ) : (
                    <p className="text-center mt-3">No messages yet</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <ChatFooter
                  documents={documents}
                  setDocuments={setDocuments}
                  toSend={toSend}
                  setToSend={setToSend}
                  handleKeyDown={handleKeyDown}
                  handleSend={handleSend}
                />
              </div>
            ) : (
              <div className="card bg-gray mt-1 me-3 px-3 msg-main">
                <p className="text-center mt-3">Select a thread to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
