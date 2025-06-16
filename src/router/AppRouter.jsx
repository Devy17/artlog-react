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
import PageTransition from '../Component/common/PageTransition';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<PageTransition><MainPage /></PageTransition>} />
      {/* <Route path='/' element={<ContentViewPage />} /> */}
      {/* 로그인 토큰 테스트 */}
      <Route path='/login' element={<PageTransition><SignInPage /></PageTransition>} />
      <Route path='/signup' element={<PageTransition><SignUpPage /></PageTransition>} />
      <Route path='/mypage' element={<PrivateRouter element={<PageTransition><MyPage /></PageTransition>} />} />

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
    </Routes>
  );
};

export default AppRouter;
