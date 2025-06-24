import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const user = createSlice({
  name: 'user',
  initialState: null as any | null ,
  reducers: {
    setUser(state, { payload }: PayloadAction<any | null>) {
      return state = (payload != null) ? payload : null;
    }
  },
});

export const { setUser } = user.actions;
export default user.reducer;