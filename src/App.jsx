import { useState } from 'react';
import AppRouter from './router/AppRouter';
import { AuthContextProvider } from './content/UserContext';
import Header from './Component/common/Header/Header';
import Footer from './Component/common/Footer/Footer';
import ModalContext from './Modal/ModalContext';
import ModalController from './Modal/ModalController';

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
          <Footer />
          <ModalController modalType={modalType} setModalType={setModalType} />
        </div>
      </ModalContext.Provider>
    </AuthContextProvider>
  );
}

export default App;
