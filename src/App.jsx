import AppRouter from './router/AppRouter';
import Header from './Component/common/Header';
import Footer from './Component/common/Footer';

function App() {
  return (
    <>
      <div className='App'>
        <Header />
        <div className='content-wrapper'>
          <AppRouter />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
