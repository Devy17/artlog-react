import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';
import Home from '../Component/Home';
import SignInPage from '../Page/user/SignInPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* 임의의 Home 개설 메인페이지 담당하시는 분은 Home 제거 후 메인페이지 연결해주세요 */}
      <Route path='/' element={<Home />} />
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
