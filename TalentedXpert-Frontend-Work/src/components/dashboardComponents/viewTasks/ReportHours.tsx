import React, { useEffect, useState } from 'react';
import HoursHistory from './HoursHistory';
import { reportHoursSchema } from '@/schemas/reportHoursSchema/reportHoursSchema';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useAppDispatch, RootState } from '@/store/Store';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { dataForServer } from '@/models/reportHoursModel/reportHoursModel';
import FileUpload from '@/components/common/upload/FileUpload';
import { Icon } from '@iconify/react/dist/iconify.js';
import { AmountType } from '@/services/enums/enums';
import { uploadFileToS3 } from '@/services/uploadFileToS3/uploadFileToS3';
import DocumentUploadTable from '@/components/common/DocumentUploadTable/DocumentUploadTable';

interface HistoryEntry {
  date: string;
  time: string;
  timestamp: string;
  comment: string;
}

const ReportHours = ({ task, hoursSubmit, setHoursSubmit, proposalAmount }: any) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hoursHistory, setHoursHistory] = useState<HistoryEntry[]>([]);
  const [manualHours, setManualHours] = useState<string>('');
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [durationError, setDurationError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  type FormSchemaType = z.infer<typeof reportHoursSchema>;

  const { register, handleSubmit, setValue, watch, clearErrors, formState: { errors } } = useForm<FormSchemaType>({
    defaultValues: {
      startTime: '',
      endTime: '',
      duration: 0,
      comment: '',
      TEProfileId: Number(user?.profile[0].id),
      taskId: Number(task?.id),
      amount: 0,
    },
    resolver: zodResolver(reportHoursSchema),
    mode: 'all',
  });

  const calculateAmount = (minutes: number) => {
    if (minutes === 0) return 0;
    const hours = minutes / 60;
    const totalAmount = hours * proposalAmount;
    return Number(totalAmount.toFixed(2));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const addToHistory = (totalSeconds: number): void => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const newEntry: HistoryEntry = {
      date: selectedDate,
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
      comment: comment,
    };

    setHoursHistory([newEntry, ...hoursHistory]);
    setComment('');
    setSeconds(0);
    setManualHours('');
    setManualMinutes('');
    setStartTime(null);
  };

  const handleStart = (): void => {
    setIsRunning(true);
    setStartTime(new Date().toISOString());
    setValue('startTime', new Date().toISOString());
  };

  const handleStop = (): void => {
    setIsRunning(false);
    setEndTime(new Date().toISOString());
    setValue('endTime', new Date().toISOString());
  };

  const handleReset = (): void => {
    setIsRunning(false);
    setSeconds(0);
    setStartTime(null);
    setEndTime(null);
    setValue('startTime', '');
    setValue('endTime', '');
  };

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    let totalSeconds = seconds;
    let durationInMinutes = 0;

    if (startTime && isRunning) {
      const endTime = new Date().toISOString();
      setValue('endTime', endTime);
      totalSeconds = seconds;
      durationInMinutes = Math.floor(totalSeconds / 60);
    } else if (startTime && !isRunning) {
      totalSeconds = seconds;
      durationInMinutes = Math.floor(totalSeconds / 60);
    } else if (manualHours || manualMinutes) {
      setStartTime(null);
      const hours = parseInt(manualHours) || 0;
      const minutes = parseInt(manualMinutes) || 0;
      if (hours <= 24 && minutes <= 59) {
        totalSeconds = hours * 3600 + minutes * 60;
        durationInMinutes = hours * 60 + minutes;
      }
    }

    // Check if duration is 0
    if (durationInMinutes === 0) {
      setDurationError('Work log cannot be less than a minute');
      return;
    } else {
      setDurationError(null);
    }

    const updatedData = {
      ...data,
      date: selectedDate,
      startTime: manualHours || manualMinutes ? null : startTime ? startTime : new Date().toISOString(),
      endTime: manualHours || manualMinutes ? null : endTime ? endTime : new Date().toISOString(),
      duration: durationInMinutes,
      amount: calculateAmount(durationInMinutes),
      comment: comment,
      documents: documents,
    };

    const formData = dataForServer(updatedData);

    try {
      const res = await apiCall(requests.hourlyLog, formData, 'post', true, dispatch, user, router);
      if (res?.error) {
        const message = res?.error?.message;
        if (Array.isArray(message)) {
          message?.map((msg: string) => toast.error(msg || 'Something went wrong, please try again'));
        } else {
          toast.error(message || 'Something went wrong, please try again');
        }
      } else {
        toast.success(res?.data?.message);
        hoursSubmit ? setHoursSubmit(false) : setHoursSubmit(true);
        if (totalSeconds > 0) {
          addToHistory(totalSeconds);
        }
      }
    } catch (err) {
      console.warn(err);
    }

    setIsRunning(false);
    setSeconds(0);
  };

  const handleFileSelect = async (
    files: File[],
    fileObjs: any[],
    onProgress: (progress: number) => void
  ): Promise<number[]> => {
    const uploadedFileIds = files ? await uploadFileToS3(files, fileObjs, onProgress, true) : 0;
    const temp: any = [...documents, ...uploadedFileIds];

    if (uploadedFileIds.length > 0) {
      setDocuments(temp);
      setValue('documents', temp);
    }

    return uploadedFileIds;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-black text-white m-2 p-3 mt-4 rounded-3 report-hours-section">
        <h4 className="mb-3">Report Hours</h4>

        <div className="mb-3 d-flex align-items-center flex-wrap gap-3 ">
          <label htmlFor="dateSelect" className="me-2">Select Date:</label>
          <input
            {...register('date')}
            type="date"
            onClick={(e) => {
                                const input = e.currentTarget;
                                input.showPicker?.(); 
                              }}
            max={new Date().toISOString().split('T')[0]}
            id="dateSelect"
            className="form-control w-auto invert"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="d-flex align-items-center gap-2">
            <FileUpload
              onFileSelect={handleFileSelect}
              label="Attach File"
              accept="image/*,application/pdf"
              type="task"
            />
            <DocumentUploadTable />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-stretch gap-3 mb-3 flex-wrap">
          {/* Left Section: Manual Log */}
          <div className="bg-dark p-3 rounded-3 flex-fill">
            <h6 className="mb-3">Manual Log</h6>
            <div className="d-flex align-items-center gap-2">
              <input
                type="number"
                className="form-control w-25 invert"
                placeholder="Hours"
                min="0"
                max="24"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value || '0')}
              />
              <span>:</span>
              <input
                type="number"
                className="form-control w-25 invert"
                placeholder="Minutes"
                min="0"
                max="59"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value || '0')}
              />
            </div>
          </div>

          {/* Right Section: Timer */}
          <div className="bg-dark p-3 rounded-3 flex-fill">
            <h6 className="mb-3">Timer</h6>
            <div className="d-flex flex-column align-items-center gap-3">
              <div
                className="bg-dark text-white p-3 rounded-3 d-flex justify-content-center align-items-center"
                style={{ minWidth: '150px' }}
              >
                <span className="fs-1 fw-bold">{formatTime(seconds)}</span>
              </div>
              <div className="d-flex gap-3">
                <button
                  type="button"
                  className={`btn ${isRunning ? 'btn-secondary' : 'btn-success'} rounded-pill px-4`}
                  onClick={handleStart}
                  disabled={isRunning}
                >
                  Start
                </button>
                <button
                  type="button"
                  className={`btn ${!isRunning ? 'btn-secondary' : 'btn-danger'} rounded-pill px-4`}
                  onClick={handleStop}
                  disabled={!isRunning}
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <textarea
            className="form-control mb-3 invert"
            placeholder="Add a comment"
            value={comment}
            {...register('comment')}
            onChange={(e) => {
              setComment(e.target.value);
              setValue('comment', e.target.value);
            }}
          />
          {durationError && (
            <div className="text-danger mb-3">{durationError}</div>
          )}
          <button type="submit" className="btn btn-primary rounded-pill">
            Submit
          </button>
        </div>

        {task?.weeklyMilestones && <HoursHistory HoursHistory={task?.weeklyMilestones} />}
      </div>
    </form>
  );
};

export default ReportHours;