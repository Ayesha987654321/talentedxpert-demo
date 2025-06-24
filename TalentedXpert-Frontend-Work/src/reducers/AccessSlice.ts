import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  isAccess: false,
};

const access = createSlice({
  name: 'access',
  initialState,
  reducers: {
    setIsAccessed(state, { payload }) {
      state.isAccess = payload;
    }
  },
});

export const { setIsAccessed } = access.actions;
export default access.reducer;