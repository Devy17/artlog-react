import { useState } from 'react';
import AppRouter from './router/AppRouter';
import Header from './Component/common/Header/Header';
import Footer from './Component/common/Footer/Footer';
import ModalContext from './Modal/ModalContext';
import ModalController from './Modal/ModalController';
import { AuthContextProvider } from './context/UserContext';
import ScrollToTop from './Component/common/ScrollToTop';

function App() {
  const [modalType, setModalType] = useState(null);

  return (
    <AuthContextProvider>
      <ModalContext.Provider value={{ setModalType }}>
        <ScrollToTop /> {/* 페이지 이동 시 스크롤을 맨 위로 올려주는 컴포넌트 */}
        <div className='App'>
          <Header />
          <div style={{ height: '90px' }} />;
          <div className='content-wrapper'>
            <AppRouter /> {/* 모든 라우팅은 여기서 처리 */}
          </div>
          <Footer />
          <ModalController modalType={modalType} setModalType={setModalType} />
        </div>
      </ModalContext.Provider>
    </AuthContextProvider>
  );
}

export default App;
