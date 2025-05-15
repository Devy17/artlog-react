const clientHostName = window.location.hostname;

let backendHostName;

if (clientHostName === 'localhost') {
  backendHostName = 'http://localhost:8000';
} else if (
  clientHostName ===
  'artlog-s3-instance-front-21974.s3-website.ap-northeast-2.amazonaws.com'
) {
  // 배포해서 현재 서비스 중
  backendHostName = '43.201.55.136:8000';
}

export const API_BASE_URL = backendHostName;
export const USER = '/user-service/user';
export const REVIEW = '/review-service/review';
export const ORDER = '/order-service/order';
export const COUPON = '/coupon-service/coupon';
export const API = '/api-service/api';
