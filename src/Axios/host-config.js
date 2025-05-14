const clientHostName = window.location.hostname;

let backendHostName;

if (clientHostName === 'localhost') {
  backendHostName = 'http://localhost:8000';
} else if (
  clientHostName ===
  'artlog-s3-front-end-1733.s3-website-ap-southeast-2.amazonaws.com'
) {
  // 배포해서 현재 서비스 중
  backendHostName = 'Write Down Our Back End Address';
}

export const API_BASE_URL = backendHostName;
export const USER = '/user-service/user';
export const REVIEW = '/review-service/review';
export const ORDER = '/order-service/order';
export const COUPON = '/coupon-service/coupon';
export const API = '/api-service/api';
