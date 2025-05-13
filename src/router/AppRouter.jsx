import React from 'react';
import MainVisual from '../Component/common/main/MainPage/MainVisual';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import SignInPage from '../Page/user/SignInPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<MainVisual />} />
      {/* 로그인 토큰 테스트 */}
      <Route
        path='/test'
        element={<PrivateRouter element={<SignInPage />} />}
      />
      <Route path='/login' element={<SignInPage />} />
    </Routes>
  );
};

export default AppRouter;
