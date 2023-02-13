import { DEFAULT_ACCESS_TOKEN_NAME } from './../providers/sheshaApplication/contexts';
import axios from 'axios';
import { requestHeaders } from '../utils/requestHeaders';

export const axiosHttp = (baseURL: string, tokenName?: string) =>
  axios.create({
    baseURL,
    timeout: 10000,
    headers: requestHeaders(tokenName || DEFAULT_ACCESS_TOKEN_NAME, { addCustomHeaders: true }),
  });
