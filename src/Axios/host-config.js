const clientHostName = window.location.hostname;

let backendHostName;

if (clientHostName === 'localhost') {
  backendHostName = 'http://localhost:8000';
} else {
  // 배포해서 현재 서비스 중
  backendHostName = 'http://52.79.234.211:8000';
}

export const API_BASE_URL = backendHostName;
export const USER = '/user-service/user';
export const REVIEW = '/review-service/review';
export const ORDER = '/order-service/order';
export const COUPON = '/coupon-service/coupon';
export const API = '/api-service/api';
