import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import ModalContext from '../Modal/ModalContext';

// 라우터 쪽에서 로그인 여부나 권한을 검사하는 기능을 담당하는 PrivateRouter 생성.
const PrivateRouter = ({ element, requiredRole }) => {
  const { isLoggedIn, userRole, isInit } = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);
  const [redirectToHome, setRedirectToHome] = useState(false);

  // Context 데이터가 초기화되지 않았다면 밑에 로직이 실행되지 않게끔 로딩 페이지 먼저 리턴.
  // 초기화가 완료되면 PrivateRouter가 다시 렌더링 시도를 할 겁니다.
  useEffect(() => {

    if (isInit && !isLoggedIn) {
      alert('회원만 이용가능한 페이지입니다. 로그인을 해주세요!');
      setModalType('login');
      setRedirectToHome(true); // navigate는 그 다음 단계에서
    }

  }, [isInit, isLoggedIn]);


  if (!isInit) return <div>Loading...</div>;

  if (redirectToHome) {
    return <Navigate to='/' replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    if (requiredRole === 'ADMIN') {
      alert('관리자만 접근 가능합니다!');
    } else {
      alert('권한이 없습니다!');
    }
    return <Navigate to='/' replace />;
  }

  // 로그인도 했고, 권한에도 문제가 없다면 원래 렌더링 하고자 했던 컴포넌트를 렌더링.
  return element;
};

export default PrivateRouter;
