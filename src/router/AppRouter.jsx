import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import MyPage from '../Page/user/MyPage';
import ContentViewPage from '../Page/content/ContentViewPage';

import MyOrdersPage from '../Page/user/MyOrdersPage';
import Coupons from '../Page/user/Coupons';
import SignUpPage from '../Page/user/SignUpPage';
import UpdatePasswordPage from '../Page/user/UpdatePasswordPage';
import SignInPage from '../Page/user/SignInPage';
import MainVisual from '../Component/main/MainPage/MainVisual';
import ContentDetailPage from '../Page/content/ContentDetailPage';
import MyReviewsPage from '../Page/user/MyReviewsPage';
import OrderPage from '../Page/order/OrderPage';
import MainPage from '../Component/main/MainPage/MainPage';

// 관리자용
import AdminDashboard from '../Page/admin/AdminDashboard';

function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      {/* <Route path='/' element={<ContentViewPage />} /> */}
      {/* 로그인 토큰 테스트 */}
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
      <Route path='/exhibitions' element={<ContentViewPage />} />
      <Route path='/contentDetail' element={<ContentDetailPage />} />
      <Route path='/MyReviewsPage' element={<MyReviewsPage />} />
      <Route path='/order' element={<OrderPage />} />

      {/* 관리자 전용 페이지 */}
      <Route
        path='/admin'
        element={
          <PrivateRouter element={<AdminDashboard />} requiredRole='ADMIN' />
        }
      />
    </Routes>
  );
}

export default AppRouter;
