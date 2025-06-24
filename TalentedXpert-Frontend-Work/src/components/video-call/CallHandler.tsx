'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/Store';
import useSocket from '@/hooks/useSocket';
import VideoCall from './VideoCall';
import { endCall, receiveCall, setCallData, setCallThread } from '@/reducers/CallSlice';
import axios from 'axios';
import { checkPermissions } from '@/services/utils/util';

interface PendingCall {
    threadId: number;
    roomId: string;
    callerName: string;
}

const CallHandler: React.FC = () => {
    const dispatch = useDispatch();
    const { socket } = useSocket();
    const user = useSelector((state: RootState) => state.user);
    const { callActive, isCaller, callData, thread } = useSelector((state: RootState) => state.call);
    const [pendingCalls, setPendingCalls] = useState<PendingCall[]>([]);

    // Join thread room
    useEffect(() => {
        if (socket && thread?.id) {
            socket.emit('join_thread', { threadId: thread.id });
        }
    }, [socket, thread?.id]);

    // Derive userName safely
    const userName =
        user?.profile ? user?.profile[0]?.type === 'TE'
            ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
            'Expert User'
            : `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
            'Requester User' : '';

    useEffect(() => {
        if (!socket) return;

        const handleCallRinging = async (data: { threadId: number; roomId: string; callerName: string; receiverProfileId: number; callerProfileId: number }) => {
            if (!callActive) {
                try {
                    const permissionsGranted = await checkPermissions();
                    if (!permissionsGranted) {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: true,
                            video: true,
                        });
                        stream.getTracks().forEach((track) => track.stop());
                    }

                    const response = await axios.post('/api/videosdk', { threadId: data.threadId });
                    if (!response.data.token || !response.data.roomId) {
                        throw new Error('Invalid VideoSDK response');
                    }
                    dispatch(setCallThread({ id: data.threadId }));
                    dispatch(receiveCall());
                    dispatch(setCallData({
                        threadId: data.threadId,
                        token: response.data.token,
                        roomId: data.roomId,
                        receiverProfileId: data.receiverProfileId,
                        callerProfileId: data.callerProfileId,
                        callerName: data.callerName,
                        status: 'ringing',
                    }));
                } catch (error: any) {
                    dispatch(endCall());
                }
            } else {
                setPendingCalls((prev) => [
                    ...prev.filter((call) => call.threadId !== data.threadId),
                    { threadId: data.threadId, roomId: data.roomId, callerName: data.callerName },
                ]);
            }
        };

        socket.on('call_ringing', handleCallRinging);

        return () => {
            socket.off('call_ringing', handleCallRinging);
        };
    }, [socket, dispatch, callActive]);

    const handleEndCall = (event: string | null, callerData: any) => {
        if (socket?.connected && thread.id) {
            dispatch(endCall());
            event !== null && socket.emit(event, {
                threadId: thread.id,
                receiverProfileId: callerData.receiverProfileId,
                callerProfileId: callerData.callerProfileId,
            });
        }
        setPendingCalls([]);
    };

    const handleRejectPendingCall = (threadId: number) => {
        setPendingCalls((prev) => prev.filter((call) => call.threadId !== threadId));
        if (socket?.connected) {
            socket.emit('call_rejected', {
                threadId,
                receiverProfileId: callData.receiverProfileId,
                callerProfileId: callData.callerProfileId,
            });
        }
    };
    console.log(callActive, isCaller)
    return callActive ? (
        <VideoCall userName={userName} isCaller={isCaller} onEnd={handleEndCall} />
    ) : pendingCalls?.length > 0 ? pendingCalls.map((call) => (
        <div
            key={call.threadId}
            className="position-fixed top-0 start-0 w-100 bg-dark bg-opacity-75 p-3"
            style={{ zIndex: 1060 }}
        >
            <div className="text-white text-center">
                <p>Incoming Call from {call.callerName}</p>
                <button
                    className="btn btn-danger"
                    onClick={() => handleRejectPendingCall(call.threadId)}
                >
                    Reject
                </button>
            </div>
        </div>
    )) : null;
};

export default CallHandler;