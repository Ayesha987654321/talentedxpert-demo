import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallData {
    threadId: number;
    token: string;
    roomId: string;
    callerName: string;
    receiverProfileId: number;
    callerProfileId: number;
    status: 'ringing' | 'accepted' | 'rejected' | 'ended';
}

interface CallState {
    callActive: boolean;
    thread: any | null;
    isCaller: boolean;
    callData: CallData | null;
}

const initialState: CallState = {
    callActive: false,
    thread: null,
    isCaller: false,
    callData: null,
};

const call = createSlice({
    name: 'call',
    initialState,
    reducers: {
        startCall(state) {
            state.callActive = true;
            state.isCaller = true;
        },
        receiveCall(state) {
            state.callActive = true;
            state.isCaller = false;
        },
        endCall(state) {
            state.callActive = false;
            state.isCaller = false;
            state.callData = null;
            state.thread = null;
        },
        setCallData(state, action: PayloadAction<CallData>) {
            state.callData = action.payload;
        },
        setCallThread(state, action){
            state.thread = action.payload;
        }
    },
});

export const { startCall, receiveCall, endCall, setCallData, setCallThread } = call.actions;
export default call.reducer;