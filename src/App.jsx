import { useState } from 'react';
import AppRouter from './router/AppRouter';
import Header from './Component/common/Header/Header';
import Footer from './Component/common/Footer/Footer';
import ModalContext from './Modal/ModalContext';
import ModalController from './Modal/ModalController';
import { AuthContextProvider } from './context/UserContext';
import ExhibitionListSection from './Component/main/MainPage/ExhibitionListSection';

function App() {
  const [modalType, setModalType] = useState(null);

  return (
    <AuthContextProvider>
      <ModalContext.Provider value={{ setModalType }}>
        <div className='App'>
          <Header />
          <div className='content-wrapper'>
            <AppRouter />
          </div>
          <ExhibitionListSection />
          <Footer />
          <ModalController modalType={modalType} setModalType={setModalType} />
        </div>
      </ModalContext.Provider>
    </AuthContextProvider>
  );
}

export default App;
