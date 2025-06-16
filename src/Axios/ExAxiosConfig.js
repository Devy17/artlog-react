import axios from 'axios';

const BASE_URL = 'http://api.kcisa.kr/openapi/API_CCA_145/request';

const axiosApi = () => {
  const instance = axios.create({
    baseURL: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
    params: {
      serviceKey: '50c4abb3-0b85-4348-809c-b1df4198f4ef',
      numOfRows: '100',
      pageNo: '1',
    },
    withCredentials: true,
    responseEncoding: 'utf8',
  });
  return instance;
};

export const ExAxiosInstance = axiosApi();
