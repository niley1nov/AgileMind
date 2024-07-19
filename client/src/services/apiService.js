import axios from 'axios';

const apiClientForUnAuthReq = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});

const apiClientForAuthReq = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL
  });

export {apiClientForUnAuthReq, apiClientForAuthReq};