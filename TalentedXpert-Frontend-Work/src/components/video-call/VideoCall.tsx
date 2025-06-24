'use client';
import { FC, useCallback, useEffect, useState, memo } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { Socket } from 'socket.io-client';
import useSocket from '@/hooks/useSocket';
import { RootState } from '@/store/Store';

interface NewVideoCallProps {
    userName: string;
    isCaller: boolean;
    onEnd: (data: string | null, callerData: any) => void;
}

const VideoCall: FC<NewVideoCallProps> = ({ userName, isCaller, onEnd }) => {
    const [token, setToken] = useState<string | null>(null);
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [callStatus, setCallStatus] = useState<'ringing' | 'accepted' | 'rejected' | 'ended'>('ringing');
    const [otherParticipant, setOtherParticipant] = useState<{ name: string; status: string } | null>(null);
    const [isInitiating, setIsInitiating] = useState(false);
    const { socket } = useSocket();
    const { callActive, callData, thread } = useSelector((state: RootState) => state.call);
    const [callsId, setCallId] = useState<any>({})

    // Ringtone using an online URL
    // https://freesound.org/data/previews/316/316847_4939433-lq.mp3
    const [ringtone] = useState<HTMLAudioElement | undefined>(
        typeof Audio !== 'undefined'
            ? new Audio(`/assets/audio/i_phone_message.mp3`)
            : undefined
    );

    // Play ringtone for receiver
    useEffect(() => {
        if (callStatus === 'ringing' && !isCaller && ringtone) {
            ringtone.loop = true;
            ringtone.volume = 0.5; // Adjust volume (0.0 to 1.0)
            ringtone.play().catch((err) => console.error('Ringtone play error:', err));
        }
        return () => {
            if (ringtone) {
                ringtone.pause();
                ringtone.currentTime = 0;
            }
        };
    }, [callStatus, isCaller, ringtone]);

    const initiateCall = useCallback(async () => {
        if (!thread?.id || token || meetingId || !socket?.connected || isInitiating) {
            return;
        }

        setIsInitiating(true);

        try {
            // Validate thread data
            if (!thread.expertProfile?.user || !thread.task?.requesterProfile?.user) {
                throw new Error('Missing participant data');
            }

            // Extract participants
            const user1 =
                `${thread.expertProfile.user.firstName || 'Expert'} ${thread.expertProfile.user.lastName || ''}`.trim() ||
                'Expert User';
            const user2 =
                `${thread.task.requesterProfile.user.firstName || 'Requester'} ${thread.task.requesterProfile.user.lastName || ''
                    }`.trim() || 'Requester User';
            const participants = [{
                id: thread?.expertProfileId || 0,
                name: user1
            }, {
                id: thread?.task?.requesterProfileId || 0,
                name: user2
            }];

            if (participants.length < 2) {
                throw new Error('At least two participants are required');
            }

            const other = participants.find((p) => p.name !== userName);
            const caller = participants.find((p) => p.name === userName);

            if (!other) {
                throw new Error('No other participant found');
            }

            // Fetch VideoSDK room
            const response = await axios.post('/api/videosdk', { threadId: thread.id });
            if (!response.data.token || !response.data.roomId) {
                throw new Error('Invalid VideoSDK response');
            }

            setToken(response.data.token);
            setMeetingId(response.data.roomId);
            setOtherParticipant({ name: other.name, status: 'ringing' });

            socket.emit('initiate_call', {
                threadId: thread.id,
                roomId: response.data.roomId,
                receiverProfileId: other.id,
                callerProfileId: caller?.id,
                callerName: userName,
            });

            setCallId({
                receiverProfileId: other.id,
                callerProfileId: caller?.id,
            })
        } catch (error: any) {
            setError(error.message || 'Failed to start call');
            onEnd('call_ended', callsId);
        } finally {
            setIsInitiating(false);
        }
    }, [socket, thread, token, meetingId, userName, isInitiating, onEnd]);

    useEffect(() => {
        if (!callActive || isCaller || !callData || callData.threadId !== thread?.id) {
            return;
        }

        setToken(callData.token);
        setMeetingId(callData.roomId);
        setOtherParticipant({ name: callData.callerName, status: 'ringing' });
        setCallId({
            receiverProfileId: callData.receiverProfileId,
            callerProfileId: callData.callerProfileId,
        })
        setCallStatus('ringing');
    }, [callActive, callData, thread, isCaller]);

    useEffect(() => {
        if (isCaller && !isInitiating && socket?.connected) {
            initiateCall();
        }
    }, [isCaller, initiateCall, isInitiating, socket]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleCallAccepted = (data: { threadId: number; participantName: string }) => {
            if (data.threadId === thread?.id) {
                setCallStatus('accepted');
                setOtherParticipant((prev) => (prev ? { ...prev, status: 'joined' } : null));
            }
        };

        const handleCallRejected = (data: { threadId: number }) => {
            if (data.threadId === thread?.id) {
                setCallStatus('rejected');
                setToken(null);
                setMeetingId(null);
                setOtherParticipant(null);
                setCallId({})
                onEnd('call_rejected', callData | callsId);
            }
        };

        const handleCallEnded = (data: { threadId: number }) => {
            if (data.threadId === thread?.id) {
                setCallStatus('ended');
                setToken(null);
                setMeetingId(null);
                setOtherParticipant(null);
                setCallId({})
                onEnd('call_ended', callData | callsId);
            }
        };

        const handleUserBusy = (data: { threadId: number }) => {
            console.log('Received user_busy:', data);
            if (data.threadId === thread?.id) {
                setError('User is busy on another call');
                // onEnd();
                console.log('Call state updated:', { error: 'User busy' });
            }
        };

        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_rejected', handleCallRejected);
        socket.on('call_ended', handleCallEnded);
        socket.on('user_busy', handleUserBusy);

        return () => {
            socket.off('call_accepted', handleCallAccepted);
            socket.off('call_rejected', handleCallRejected);
            socket.off('call_ended', handleCallEnded);
            socket.off('user_busy', handleUserBusy);
        };
    }, [socket, thread, isCaller, callStatus, onEnd]);

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark" style={{ zIndex: 1050 }}>
            {error && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Error</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setError(null);
                                        onEnd('call_ended', callsId | callData);
                                    }}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-danger">{error}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        setError(null);
                                        onEnd('call_ended', callsId | callData);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {(!token || !meetingId) && (
                <div className="d-flex justify-content-center align-items-center vh-100 bg-dark bg-opacity-75 position-absolute top-0 start-0 w-100">
                    <div className="text-white fs-4">Loading call...</div>
                </div>
            )}
            {token && meetingId && (
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: callStatus === 'accepted',
                        webcamEnabled: callStatus === 'accepted',
                        name: userName,
                    }}
                    token={token}
                    joinWithoutUserInteraction={callStatus === 'accepted'}
                >
                    <MeetingView
                        isCaller={isCaller}
                        callStatus={callStatus}
                        setCallStatus={setCallStatus}
                        userName={userName}
                        otherParticipant={otherParticipant}
                        socket={socket}
                        threadId={thread?.id}
                        callsId={callsId}
                        onEnd={onEnd}
                        joinMeeting={() => {
                            if (!thread?.id) {
                                setError('Thread ID is missing');
                                return;
                            }
                            setCallStatus('accepted');
                            if (socket?.connected) {
                                socket.emit('call_accepted', { threadId: thread.id, participantName: userName });
                            }
                        }}
                    />
                </MeetingProvider>
            )}
        </div>
    );
};

interface MeetingViewProps {
    isCaller: boolean;
    callStatus: 'ringing' | 'accepted' | 'rejected' | 'ended';
    setCallStatus: (status: 'ringing' | 'accepted' | 'rejected' | 'ended') => void;
    userName: string;
    callsId: any;
    otherParticipant: { name: string; status: string } | null;
    socket: Socket | null;
    threadId: number | undefined;
    onEnd: (data: string | null, callerData: any) => void;
    joinMeeting: () => void;
}

const MeetingView: FC<MeetingViewProps> = memo(
    ({ isCaller, callStatus, setCallStatus, userName, callsId, otherParticipant, socket, threadId, onEnd, joinMeeting }) => {
        // const { participants, end, leave, join, toggleMic, toggleWebcam, micEnabled, webcamEnabled, localParticipant } =
        //     useMeeting();
        const {
            participants,
            end,
            leave,
            join,
            toggleMic,
            toggleWebcam,
            micEnabled,
            webcamEnabled,
            localParticipant,
            startRecording,
            stopRecording,
            enableScreenShare,
            disableScreenShare,
        } = useMeeting();

        const [micOn, setMicOn] = useState<boolean>(micEnabled);
        const [webcamOn, setWebcamOn] = useState<boolean>(webcamEnabled);
        const [hasJoined, setHasJoined] = useState<boolean>(false);
        const [callDuration, setCallDuration] = useState<number>(0);
        const [isRecording, setIsRecording] = useState<boolean>(false);
        const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

        useEffect(() => {
            if (callStatus === 'accepted' && !hasJoined) {
                join();
                setHasJoined(true);
            }
        }, [callStatus, hasJoined, join]);

        useEffect(() => {
            let timer: NodeJS.Timeout;
            if (callStatus === 'accepted') {
                timer = setInterval(() => {
                    setCallDuration((prev) => prev + 1);
                }, 1000);
            }
            return () => clearInterval(timer);
        }, [callStatus]);

        const participantIds: string[] = Array.from(participants.keys());
        const otherParticipantId = participantIds.find((id) => id !== localParticipant?.id);

        const handleToggleMic = useCallback(() => {
            toggleMic();
            setMicOn((prev) => !prev);
        }, [toggleMic]);

        const handleToggleWebcam = useCallback(() => {
            toggleWebcam();
            setWebcamOn((prev) => !prev);
        }, [toggleWebcam]);

        const handleToggleRecording = useCallback(() => {
            if (isRecording) {
                stopRecording();
                setIsRecording(false);
            } else {
                // Configure recording with your VideoSDK webhook or S3/GCS storage
                startRecording({
                    webhookUrl: 'YOUR_WEBHOOK_URL', // Set up in VideoSDK dashboard
                    // awsDirPath: 'YOUR_S3_PATH', // Optional: for S3 storage
                });
                setIsRecording(true);
            }
        }, [isRecording, startRecording, stopRecording]);

        const handleToggleScreenShare = useCallback(() => {
            if (isScreenSharing) {
                disableScreenShare();
                setIsScreenSharing(false);
            } else {
                enableScreenShare();
                setIsScreenSharing(true);
            }
        }, [isScreenSharing, enableScreenShare, disableScreenShare]);

        const handleEndCall = useCallback(() => {
            try {
                end();
                if (isRecording) {
                    stopRecording();
                    setIsRecording(false);
                }
                if (isScreenSharing) {
                    disableScreenShare();
                    setIsScreenSharing(false);
                }
            } catch (error) {
                console.error('Error ending meeting:', error);
                leave(); // Fallback to leave
            }
            setCallStatus('ended');
            if (socket?.connected && threadId && callsId) {
                socket.emit('call_ended', {
                    threadId,
                    receiverProfileId: callsId.receiverProfileId,
                    callerProfileId: callsId.callerProfileId,
                });
            }
            setCallStatus('ended');
            onEnd(null, null);
        }, [end, leave, setCallStatus, socket, threadId, callsId, onEnd]);

        const handleAcceptCall = useCallback(() => {
            joinMeeting();
            console.log('Accepted call:', { threadId, userName });
        }, [joinMeeting, threadId, userName]);

        const handleRejectCall = useCallback(() => {
            try {
                end();
            } catch (error) {
                leave();
            }
            setCallStatus('rejected');
            if (socket?.connected && threadId && callsId) {
                socket.emit('call_rejected', {
                    threadId,
                    receiverProfileId: callsId.receiverProfileId,
                    callerProfileId: callsId.callerProfileId,
                });
            } else {
                console.warn('Socket not connected, cannot emit call_rejected');
            }
            onEnd(null, null);
        }, [end, leave, setCallStatus, socket, threadId, callsId, onEnd]);

        const formatDuration = (seconds: number): string => {
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };

        if (callStatus === 'ringing' && !isCaller) {
            return (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white">
                    <div className="text-center">
                        <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ width: '100px', height: '100px', fontSize: '48px' }}
                        >
                            {otherParticipant?.name?.charAt(0) || '?'}
                        </div>
                        <h1 className="h3 mb-2">Incoming Call</h1>
                        <p className="h5">{otherParticipant?.name || 'Unknown'}</p>
                        <p className="mt-2">Calling...</p>
                    </div>
                    <div className="d-flex gap-3 mt-4">
                        <button className="btn btn-success btn-lg" onClick={handleAcceptCall} title="Accept Call">
                            <Icon icon="material-symbols:check" width={24} />
                        </button>
                        <button className="btn btn-danger btn-lg" onClick={handleRejectCall} title="Reject Call">
                            <Icon icon="material-symbols:close" width={24} />
                        </button>
                    </div>
                </div>
            );
        }

        if (callStatus === 'rejected' || callStatus === 'ended') {
            return (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-white">
                    <div className="text-center">
                        <h1 className="h3 mb-4">{callStatus === 'rejected' ? 'Call Rejected' : 'Call Ended'}</h1>
                        <button className="btn btn-danger" onClick={() => callStatus === 'rejected' ? onEnd('call_rejected', callsId) : onEnd('call_ended', callsId)}>
                            Close
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column bg-dark text-white">
                <div className="p-3 bg-secondary d-flex justify-content-between align-items-center">
                    <span className="fw-medium">
                        {callStatus === 'ringing' ? 'Calling...' : `In Call ${formatDuration(callDuration)}`}
                        {isRecording && <span className="ms-2 text-danger">● REC</span>}
                    </span>
                    <span>{otherParticipant?.name || 'Participant'}</span>
                </div>
                <div className="flex-grow-1 position-relative">
                    <div className="position-absolute top-0 start-0 w-100 h-100">
                        {callStatus === 'accepted' && otherParticipantId ? (
                            <ParticipantView participantId={otherParticipantId} />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary">
                                <div className="text-center">
                                    <div
                                        className="rounded-circle bg-dark d-flex align-items-center justify-content-center mx-auto mb-3"
                                        style={{ width: '80px', height: '80px', fontSize: '32px' }}
                                    >
                                        {otherParticipant?.name?.charAt(0) || '?'}
                                    </div>
                                    <p className="h5">{otherParticipant?.name || 'Participant'}</p>
                                    <p className="mt-2">{callStatus === 'ringing' ? 'Ringing...' : 'Waiting...'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {localParticipant?.id && (
                        <div
                            className={`position-absolute bottom-0 end-0 rounded shadow ${callStatus === 'ringing' && isCaller ? 'shadow-lg' : ''}`}
                            style={{ width: '250px', height: '200px' }}
                        >
                            <ParticipantView participantId={localParticipant.id} isSelf />
                        </div>
                    )}
                </div>
                {(callStatus === 'accepted' || (callStatus === 'ringing' && isCaller)) && (
                    <div className="p-3 bg-secondary d-flex justify-content-center gap-3 flex-wrap">
                        <button
                            className={`btn ${micOn ? 'btn-secondary' : 'btn-danger'}`}
                            onClick={handleToggleMic}
                            title={micOn ? 'Mute' : 'Unmute'}
                        >
                            <Icon icon={micOn ? 'mdi:microphone' : 'mdi:microphone-off'} width={24} />
                        </button>
                        <button
                            className={`btn ${webcamOn ? 'btn-secondary' : 'btn-danger'}`}
                            onClick={handleToggleWebcam}
                            title={webcamOn ? 'Turn Off Video' : 'Turn On Video'}
                        >
                            <Icon icon={webcamOn ? 'mdi:video' : 'mdi:video-off'} width={24} />
                        </button>
                        <button
                            className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary border'}`}
                            onClick={handleToggleRecording}
                            title={isRecording ? 'Stop Recording' : 'Start Recording'}
                        >
                            <Icon icon={isRecording ? 'mdi:record-circle' : 'mdi:record'} width={24} />
                        </button>
                        <button
                            className={`btn ${isScreenSharing ? 'btn-danger' : 'btn-secondary border'}`}
                            onClick={handleToggleScreenShare}
                            title={isScreenSharing ? 'Stop Share' : 'Share'}
                        >
                            <Icon icon={isScreenSharing ? 'mdi:monitor-share-off' : 'mdi:monitor-share'} width={24} />
                        </button>
                        <button className="btn btn-danger" onClick={handleEndCall} title="End Call">
                            <Icon icon="material-symbols-light:call-end" width={24} />
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

interface ParticipantViewProps {
    participantId: string;
    isSelf?: boolean;
}

const ParticipantView: FC<ParticipantViewProps> = memo(({ participantId, isSelf = false }) => {
    const { webcamStream, micStream, displayName, screenShareStream } = useParticipant(participantId);
    const { localParticipant } = useMeeting();

    if (!participantId) {
        return (
            <div className="position-relative w-100 h-100 bg-secondary rounded d-flex align-items-center justify-content-center text-white">
                No Participant
            </div>
        );
    }

    return (
        <div className="position-relative w-100 h-100 bg-secondary rounded overflow-hidden">
            {screenShareStream ? (
                <video
                    autoPlay
                    muted
                    ref={(ref) => {
                        if (ref && screenShareStream) {
                            ref.srcObject = new MediaStream([screenShareStream.track]);
                            ref.play().catch((err) => console.error('Screen share play error:', err));
                        }
                    }}
                    className="w-100 h-100 object-fit-contain"
                />
            ) : webcamStream ? (
                <video
                    autoPlay
                    muted={isSelf || participantId === localParticipant?.id}
                    ref={(ref) => {
                        if (ref && webcamStream) {
                            ref.srcObject = new MediaStream([webcamStream.track]);
                            ref.play().catch((err) => console.error('Video play error:', err));
                        }
                    }}
                    className="w-100 h-100 object-fit-cover"
                />
            ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                    <span>{displayName || 'No Video'}</span>
                </div>
            )}
            {micStream && !isSelf && participantId !== localParticipant?.id && (
                <audio
                    autoPlay
                    ref={(ref) => {
                        if (ref && micStream) {
                            ref.srcObject = new MediaStream([micStream.track]);
                            ref.play().catch((err) => console.error('Audio play error:', err));
                        }
                    }}
                />
            )}
            <div className="position-absolute bottom-0 start-0 bg-dark bg-opacity-50 px-2 py-1 rounded">
                {displayName || 'Participant'}
            </div>
            {!micStream && (
                <div className="position-absolute top-0 end-0 bg-danger p-1 rounded-circle">
                    <Icon icon="mdi:microphone-off" width={16} />
                </div>
            )}
            {screenShareStream && (
                <div className="position-absolute top-0 start-0 bg-info p-1 rounded-circle">
                    <Icon icon="mdi:monitor-share" width={16} />
                </div>
            )}
        </div>
    );
});

MeetingView.displayName = 'MeetingView';
ParticipantView.displayName = 'ParticipantView';

export default VideoCall;