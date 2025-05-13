import React from 'react';
import MainVisual from '../Component/main/MainPage/MainVisual';
import { Route, Routes } from 'react-router-dom';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<MainVisual />} />
    </Routes>
  );
};

export default AppRouter;
