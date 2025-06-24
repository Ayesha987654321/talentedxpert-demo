import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const thread = createSlice({
  name: 'thread',
  initialState: null as any | null ,
  reducers: {
    setThread(state, { payload }: PayloadAction<any | null>) {
      return state = (payload != null) ? payload : null;
    }
  },
});

export const { setThread } = thread.actions;
export default thread.reducer;