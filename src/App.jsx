import AppRouter from './router/AppRouter';
import { AuthContextProvider } from './content/UserContext';
import Header from './Component/common/Header/Header';
import Footer from './Component/common/Footer/Footer';

function App() {
  return (
    <AuthContextProvider>
      <div className='App'>
        <Header />
        <div className='content-wrapper'>
          <AppRouter />
        </div>
        <Footer />
      </div>
    </AuthContextProvider>
  );
}

export default App;
