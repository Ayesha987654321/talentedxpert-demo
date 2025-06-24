import { createSlice } from '@reduxjs/toolkit';
import { closeSocket } from "@/services/utils/socket";

const initialState: any = {
  token: null,
  isAuthenticated: false,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveToken(state, { payload }) {
      if (payload) {
        state.token = payload;
      }
    },
    clearToken(state) {
      state.token = null;
      closeSocket();
    },
    setAuthState(state, { payload }) {
      state.isAuthenticated = payload;
    },
    setIsVerified(state, { payload }) {
      state.isVerified = payload;
    },
  },
});

export const { saveToken, clearToken, setAuthState, setIsVerified } = auth.actions;
export default auth.reducer;