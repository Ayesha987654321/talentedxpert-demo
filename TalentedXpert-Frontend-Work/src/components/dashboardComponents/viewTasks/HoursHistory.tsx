import apiCall from "@/services/apiCall/apiCall";
import { requests } from "@/services/requests/requests";
import { RootState, useAppDispatch } from "@/store/Store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface HourlyLog {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  amount: number;
  isApproved: boolean;
  comment: string;
}

interface WeeklyMilestone {
  id: number;
  week: number;
  startDate: string;
  endDate: string;
  status: string;
  taskId: number;
  hourlylogs: HourlyLog[];
}

interface HoursHistoryProps {
  HoursHistory: WeeklyMilestone[];
  milestoneIndex?: number;
}

const HoursHistory: React.FC<HoursHistoryProps> = ({
  HoursHistory,
  milestoneIndex,
}) => {
  const [hoursHistory, setHoursHistory] = useState<WeeklyMilestone[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    // Check if HoursHistory exists and is an array first
    if (Array.isArray(HoursHistory)) {
      if (
        milestoneIndex !== undefined &&
        milestoneIndex >= 0 &&
        milestoneIndex < HoursHistory.length
      ) {
        // Show specific milestone if index is valid
        setHoursHistory([HoursHistory[milestoneIndex]]);
      } else {
        // Show all milestones
        setHoursHistory(HoursHistory);
      }
    } else {
      // Fallback to empty array if HoursHistory is not valid
      setHoursHistory([]);
    }
  }, [HoursHistory, milestoneIndex]);

  // useEffect(() => {
  //   setHoursHistory(HoursHistory || []); // Ensure fallback to empty array if HoursHistory is undefined/null
  // }, [HoursHistory]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(
      remainingMinutes
    ).padStart(2, "0")}`;
  };

  const formatTime = (time: string | null): string => {
    if (!time) return "";
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const calculateTotalHours = (): string => {
    const totalSeconds =
      hoursHistory
        ?.flatMap((milestone) => milestone.hourlylogs)
        .reduce((acc, log) => acc + log.duration, 0) || 0; // Fallback to 0 if undefined
    return formatDuration(totalSeconds);
  };

  const formatDateWithDay = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleApprove = async (logId: number) => {
    const data = {
      isApproved: true,
    };
    try {
      const res = await apiCall(
        requests.hourlyLog + "/" + Number(logId),
        data,
        "put",
        true,
        dispatch,
        user,
        router
      );
      if (res?.error) {
        const message = res?.error?.message;
        if (Array.isArray(message)) {
          message?.map((msg: string) =>
            toast.error(msg || "Something went wrong, please try again")
          );
        } else {
          toast.error(message || "Something went wrong, please try again");
        }
      } else {
        toast.success(res?.data?.message);
        setHoursHistory((prev) =>
          prev.map((milestone) => ({
            ...milestone,
            hourlylogs: milestone.hourlylogs.map((log: any) =>
              log.id === logId ? { ...log, isApproved: true } : log
            ),
          }))
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const groupedByWeek = hoursHistory?.length
    ? hoursHistory.reduce((acc, milestone) => {
        acc[milestone?.week] = milestone?.hourlylogs;
        return acc;
      }, {} as Record<number, HourlyLog[]>)
    : {};

  return (
    <div className="hours-history mt-4 position-relative">
      <div className="total-hours mb-3 position-absolute top-0 end-0">
        <span className="text-white fw-bold">
          Total Hours: {calculateTotalHours()}
        </span>
      </div>
      <h6 className="text-white">Recent Reported Hours</h6>
      <div className="history-list text-white pt-4">
        {Object.keys(groupedByWeek).length === 0 ? (
          <p>No hours reported yet</p>
        ) : (
          Object.entries(groupedByWeek).map(([week, logs]) => (
            <div key={week} className="week-group mb-4">
              <h5 className="text-white">Week {week}</h5>
              <ul className="list-unstyled">
                {logs?.length > 0 &&
                  logs.map((log: HourlyLog, index: number) => (
                    <li
                      key={index}
                      className="history-entry p-2 mb-2 bg-dark rounded"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold">
                            {formatDateWithDay(log.date)}
                          </span>
                          <span>
                            {formatTime(log.startTime)}
                            <span className="mx-2">-</span>
                            {formatTime(log.endTime)}
                          </span>
                          <span className="text-info fw-bold">
                            {formatDuration(log.duration)}
                          </span>
                          <span className="mx-2">{`($${log.amount})`}</span>
                        </div>
                        {user?.profile[0]?.type === "TR" && (
                          <button
                            className={`btn btn-sm ${
                              log.isApproved ? "btn-success" : "btn-primary"
                            }`}
                            type="button"
                            id={String(log.id)}
                            onClick={() => handleApprove(log.id)}
                            disabled={log.isApproved}
                          >
                            {log.isApproved ? "Approved ✓" : "Approval Pending"}
                          </button>
                        )}
                        {user?.profile[0]?.type === "TE" && (
                          <div
                            style={{
                              width: "140px",
                              height: "35px",
                              borderRadius: "5px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: log.isApproved
                                ? "#28a745"
                                : "#007bff",
                              color: "white",
                              marginTop: "15px",
                              // padding: "15px",
                            }}
                            // disabled={true}
                            // className={`btn btn-sm ${
                            //   log.isApproved ? "btn-success" : "btn-primary"
                            // }`}
                          >
                            {log.isApproved ? "Approved ✓" : "Approval Pending"}
                          </div>
                        )}
                      </div>
                      <div className="comment text-white mt-1">
                        {log.comment || "No comment"}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HoursHistory;
