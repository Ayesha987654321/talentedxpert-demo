import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requests } from '../services/requests/requests';
import apiCall from '../services/apiCall/apiCall';

const date = new Date();
const time = date.getTime();

const initialState = {
  countriesList: [],
  loading: false,
  countriesTime: 0
}

export const getCountries = createAsyncThunk(
  'countries/getCountries',
  async () => {
    const res = await apiCall(`${requests.countries}`, {}, 'get', false, null, null, null);
    return res?.data;
  }
);

const countries = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCountries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCountries.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.countriesList = payload;
        state.countriesTime = time;
      })
      .addCase(getCountries.rejected, (state) => {
        state.loading = false;
      });
  }
});

const countriesReducer = countries.reducer;
export default countriesReducer;
