import React, { FC, useState } from "react";
import { Icon } from "@iconify/react";
import NoFound from "@/components/common/NoFound/NoFound";
import InviteMemberModal from "@/components/common/Modals/InviteMemberModal";
import HtmlData from "@/components/common/HtmlData/HtmlData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigation } from "@/hooks/useNavigation";
import { setThread } from "@/reducers/ThreadSlice";

const TeamTable: FC<any> = ({ data, type, handleAction }) => {
  const user = useSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectTeam, setSelectTeam] = useState<any>({});
  const { navigate } = useNavigation();

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleInvite = (row: any) => {
    setShowModal(true);
    setSelectTeam(row);
  };

  const closeInvite = () => {
    setShowModal(false);
    setSelectTeam({});
  };

  const getMessageThread = async (row: any) => {
    console.log('row team', row)
    try {
      const response = await apiCall(
        requests.getThread,
        {
          // teamId: row.id,
        },
        "get",
        false,
        dispatch,
        user,
        router
      );
      const matchingThread = response?.data?.threads?.find(
        (thread: any) => thread.expertProfileId === row.id
      );
      if (matchingThread) {
        dispatch(setThread(matchingThread));
        router.push(`/dashboard/messages/${matchingThread?.id}`);
      } else {
        let data = {
          teamId: row.id,
          threadType: "TEAM"
        };

      
        const res = await apiCall(
          requests.createThread,
           data,
          "post",
          false,
          dispatch,
          user,
          router
        );
        dispatch(setThread(res?.data.thread));
        router.push(`/dashboard/messages/${res?.data.thread?.id}`);
      }
    } catch (error) {
      console.warn("Error fetching threads", error);
    }
  };


  const handleAcceptReject = async (status: string, id: number) => {
    await apiCall(
      `${requests.invitation}/${id}`,
      { invitationStatus: status },
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
          toast.success(res?.data?.message);
          handleAction(type);
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  return (
    <div className="table-responsive mt-3">
      <table className="table">
        <thead className="table-light">
          <tr>
            <th scope="col" className="nr bg-black text-white border-0">
              Team Name
            </th>
            <th scope="col" className="bg-black text-white border-0">
              Description
            </th>
            {type === "Invites" ? (
              <th scope="col" className="nr bg-black text-white border-0">
                Invitation Status
              </th>
            ) : (
              <th scope="col" className="nr bg-black text-white border-0">
                Number of Members
              </th>
            )}
            <th scope="col" className="bg-black text-white border-0">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="table-dark">
          {data?.length > 0 &&
            data?.map((row: any) => {
              return (
                <tr key={row?.id}>
                  <td>{row?.name || row?.team?.name}</td>
                  <td>
                    <HtmlData
                      data={
                        row?.description?.slice(0, 50) ||
                        row?.team?.description?.slice(0, 50) ||
                        ""
                      }
                    />
                  </td>
                  {type === "Invites" ? (
                    <td>{row?.invitationStatus}</td>
                  ) : (
                    <td>{row?.teamMembers?.length}</td>
                  )}
                  <td>
                    <div className="d-flex gap-2">
                      {type === "Invites" ? (
                        <>
                          <span
                            className={`cursor me-2 text-info ${row?.invitationStatus === "PENDING"
                                ? ""
                                : "disabled"
                              }`}
                            id={row?.id}
                            onClick={() =>
                              handleAcceptReject("ACCEPTED", row?.id)
                            }
                          >
                            Accept
                          </span>
                          /
                          <span
                            className={`cursor ms-2 text-danger ${row?.invitationStatus === "PENDING"
                                ? ""
                                : "disabled"
                              }`}
                            id={row?.id}
                            onClick={() =>
                              handleAcceptReject("REJECTED", row?.id)
                            }
                          >
                            Reject
                          </span>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm btn-outline-info text-white"
                            onClick={() => handleInvite(row)}
                          >
                            Add
                          </button>
                          <Link
                            href={`/dashboard/teams/${row?.id}`}
                            onClick={() =>
                              navigate(`/dashboard/teams/${row?.id}`)
                            }
                            className="btn btn-secondary btn-sm btn-outline-info text-white"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm btn-outline-info text-white"
                            onClick={() => getMessageThread(row)}
                          >
                            Message
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          {data?.length === 0 && (
            <tr>
              <td colSpan={4}>
                <NoFound message={"No teams found yet"} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showModal && (
        <InviteMemberModal
          isOpen={showModal}
          onClose={closeInvite}
          data={selectTeam}
        />
      )}
    </div>
  );
};

export default TeamTable;
