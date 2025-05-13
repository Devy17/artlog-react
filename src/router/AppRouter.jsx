import React from 'react';
import Home from '../Component/Home';
import { Route, Routes } from 'react-router-dom';
import SignUpPage from '../page/user/SignUpPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* 임의의 Home 개설 메인페이지 담당하시는 분은 Home 제거 후 메인페이지 연결해주세요 */}
      <Route path='/' element={<Home />} />
      <Route path='/signup' element={<SignUpPage />} />
    </Routes>
  );
};

export default AppRouter;
