import React from 'react';
import MainVisual from '../Component/common/main/MainPage/MainVisual';
import { Route, Routes } from 'react-router-dom';
import SignUpPage from '../page/user/SignUpPage';
import PrivateRouter from './PrivateRouter';
import SignInPage from '../Page/user/SignInPage';
import MyPage from '../page/user/MyPage';
import ContentViewPage from '../Page/content/ContentViewPage';
import ContentDetailPage from '../Page/content/ContentDetailPage';

import UpdatePwPage from '../page/user/UpdatePasswordPage';
import MyOrdersPage from '../Page/user/MyOrdersPage';
import Coupons from '../Page/user/Coupons';

const AppRouter = () => {
  return (
    <Routes>
      {/* <Route path='/' element={<MainVisual />} /> */}
      <Route path='/' element={<ContentViewPage />} />
      {/* 로그인 토큰 테스트 */}
      <Route
        path='/test'
        element={<PrivateRouter element={<SignInPage />} />}
      />
      <Route path='/login' element={<SignInPage />} />
      <Route path='/signup' element={<SignUpPage />} />
      <Route path='/mypage' element={<PrivateRouter element={<MyPage />} />} />

      <Route
        path='/updatePwPage'
        element={<PrivateRouter element={<UpdatePwPage />} />}
      />
      <Route
        path='/myOrdersPage'
        element={<PrivateRouter element={<MyOrdersPage />} />}
      />
      <Route
        path='/coupons'
        element={<PrivateRouter element={<Coupons />} />}
      />
    </Routes>
  );
};

export default AppRouter;
