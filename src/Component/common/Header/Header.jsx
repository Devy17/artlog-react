import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './Header.module.scss';
import HeaderSearchModal from './HeaderSearch';
import SignInPage from '../../../Page/user/SignInPage';
import AuthContext from '../../../context/UserContext';

const Header = () => {
  const { isLoggedIn, userRole, onLogout } = useContext(AuthContext);
  const [openModalName, setOpenModalName] = useState(null); // 'login', 'search' 등
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 관리자 여부 판단
  const isAdmin = isLoggedIn && userRole === 'ADMIN';

  // 회원가입 후 메인페이지에서 로그인 모달 띄우는 부분
  useEffect(() => {
    if (location.state?.showLoginModal) {
      const timer = setTimeout(() => {
        openModal('login');
        navigate(location.pathname, { replace: true, state: null }); // state 초기화
      }, 500);

      return () => clearTimeout(timer); // 클린업
    }
  }, [location, navigate]);

  const handleLogout = () => {
    onLogout();
    alert('로그아웃 완료!');
    window.location.href = '/';
  };

  const openModal = (name) => {
    setOpenModalName(name);
    if (name === 'search') setIsSearchOpen(true);
  };

  const closeModal = () => {
    setOpenModalName(null);
    setIsSearchOpen(false);
  };

  const toggleSearchModal = () => {
    if (isSearchOpen) {
      closeModal();
    } else {
      openModal('search');
    }
  };

  const logoImageUrl = '/logo.png';

  return (
    <>
      <header id='header' className={`${styles.header} ${styles.main}`}>
        <div className={styles.header_wrap}>
          <div className={styles.header_bottom}>
            <div className={styles.cont_inner}>
              <strong className={styles.logo}>
                <Link to={isAdmin ? '/admin' : '/'} onClick={closeModal}>
                  <img src={logoImageUrl} alt='아트로그 사이트 로고' />
                </Link>
              </strong>

              {/* 관리자 아닐 경우에만 내비게이션 표시 */}
              {!isAdmin && (
                <nav className={styles.header_navi}>
                  <ul>
                    <li>
                      <Link to='/exhibitions' onClick={closeModal}>
                        전시 정보
                      </Link>
                    </li>
                    {isLoggedIn && (
                      <li>
                        <Link to='/mypage' onClick={closeModal}>
                          마이페이지
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              )}

              <div className={styles.header_util}>
                <div className={styles.auth_links}>
                  {isLoggedIn ? (
                    <button onClick={handleLogout} type='button'>
                      LOGOUT
                    </button>
                  ) : (
                    <>
                      <button type='button' onClick={() => openModal('login')}>
                        LOGIN
                      </button>
                      <span className={styles.divider}>|</span>
                      <Link to='/signup' onClick={closeModal}>
                        SIGNUP
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 모달
      <HeaderSearchModal
        isOpen={openModalName === 'search'}
        onClose={closeModal}
      /> */}

      {/* 로그인 모달 */}
      {openModalName === 'login' && <SignInPage onClose={closeModal} />}
    </>
  );
};

export default Header;
