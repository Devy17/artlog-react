import axios from 'axios';
import { API_BASE_URL, USER } from './host-config';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청용 인터셉터
// 인터셉터의 use함수는 매개값 두 개 받습니다. 둘 다 콜백 함수 형식입니다.
// 1번째 콜백에는 정상 동작 로직, 2번째 콜백에는 과정 중 에러 발생 시 실행할 함수
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 보내기 전에 항상 처리해야 할 내용을 콜백으로 전달.
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error); // reject가 호출되면 비동기 함수가 취소됨.
  },
);

// 응답용 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => response, // 응답에 문제가 없다면 그대로 응답 객체 리턴.
  async (error) => {
    console.log(
      'response interceptor 동작함! 응답에 문제가 발생! : Maybe TOKEN',
    );
    console.log(error);
    localStorage.clear();
    return Promise.reject(error);
  },
);

export default axiosInstance;
