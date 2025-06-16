// src/router/AppRouter.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';

import MainPage from '../Component/main/MainPage/MainPage';
import MainVisual from '../Component/main/MainPage/MainVisual';

import SignInPage from '../Page/user/SignInPage';
import SignUpPage from '../Page/user/SignUpPage';
import MyPage from '../Page/user/MyPage';
import MyOrdersPage from '../Page/user/MyOrdersPage';
import UpdatePasswordPage from '../Page/user/UpdatePasswordPage';
import MyReviewsPage from '../Page/user/MyReviewsPage';
import Coupons from '../Page/user/Coupons';

import ContentViewPage from '../Page/content/ContentViewPage';
import ContentDetailPage from '../Page/content/ContentDetailPage';
import OrderPage from '../Page/order/OrderPage';

// 관리자 페이지
import AdminDashboard from '../Page/admin/AdminDashboard';
import AdminUserListPage from '../Page/admin/AdminUserListPage';
import AdminCouponListPage from '../Page/admin/AdminCouponListPage';
import AdminCouponRegisterPage from '../Page/admin/AdminCouponRegisterPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/login' element={<SignInPage />} />
      <Route path='/signup' element={<SignUpPage />} />

      <Route path='/mypage' element={<PrivateRouter element={<MyPage />} />} />
      <Route
        path='/updatePwPage'
        element={<PrivateRouter element={<UpdatePasswordPage />} />}
      />
      <Route
        path='/myOrdersPage'
        element={<PrivateRouter element={<MyOrdersPage />} />}
      />
      <Route
        path='/coupons'
        element={<PrivateRouter element={<Coupons />} />}
      />
      <Route path='/MyReviewsPage' element={<MyReviewsPage />} />
      <Route path='/exhibitions' element={<ContentViewPage />} />
      <Route path='/contentDetail' element={<ContentDetailPage />} />
      <Route path='/order' element={<OrderPage />} />

      {/* ✅ 관리자 전용 라우팅 */}
      <Route
        path='/admin'
        element={
          <PrivateRouter element={<AdminDashboard />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/admin/users'
        element={
          <PrivateRouter element={<AdminUserListPage />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/admin/coupons'
        element={
          <PrivateRouter
            element={<AdminCouponListPage />}
            requiredRole='ADMIN'
          />
        }
      />
      <Route
        path='/admin/coupon-register'
        element={
          <PrivateRouter
            element={<AdminCouponRegisterPage />}
            requiredRole='ADMIN'
          />
        }
      />
    </Routes>
  );
};

export default AppRouter;
