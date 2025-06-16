// src/router/AppRouter.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';

import MainPage from '../Component/main/MainPage/MainPage';
import PageTransition from '../Component/common/PageTransition';
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
      <Route path='/' element={<PageTransition><MainPage /></PageTransition>} />
      {/* <Route path='/' element={<ContentViewPage />} /> */}
      {/* 로그인 토큰 테스트 */}
      <Route path='/login' element={<PageTransition><SignInPage /></PageTransition>} />
      <Route path='/signup' element={<PageTransition><SignUpPage /></PageTransition>} />
      <Route path='/mypage' element={<PrivateRouter element={<PageTransition><MyPage /></PageTransition>} />} />

      <Route path='/mypage' element={<PrivateRouter element={<MyPage />} />} />
      <Route
        path='/updatePwPage'
        element={<PrivateRouter element={<PageTransition><UpdatePasswordPage /></PageTransition>} />}
      />
      <Route
        path='/myOrdersPage'
        element={<PrivateRouter element={<PageTransition><MyOrdersPage /></PageTransition>} />}
      />
      <Route
        path='/coupons'
        element={<PrivateRouter element={<PageTransition><Coupons /></PageTransition>} />}
      />
      <Route path='/exhibitions' element={<PageTransition><ContentViewPage /></PageTransition>} />
      <Route path='/contentDetail' element={<PageTransition><ContentDetailPage /></PageTransition>} />
      <Route path='/MyReviewsPage' element={<PageTransition><MyReviewsPage /></PageTransition>} />
      <Route path='/order' element={<PageTransition><OrderPage /></PageTransition>} />
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
