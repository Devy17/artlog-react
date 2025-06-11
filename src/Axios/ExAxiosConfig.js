import axios from 'axios';

const BASE_URL = 'http://api.kcisa.kr/openapi/API_CCA_145/request';

const axiosApi = () => {
  const instance = axios.create({
    baseURL: 'http://api.kcisa.kr/openapi/API_CCA_145/request',
    params: {
      serviceKey: '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',
      numOfRows: '100',
      pageNo: '1',
    },
    withCredentials: true,
    responseEncoding: 'utf8',
  });
  return instance;
};

export const ExAxiosInstance = axiosApi();
