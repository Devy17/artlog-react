import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './Header.module.scss';
import HeaderSearchModal from './HeaderSearch';
import SignInPage from '../../../Page/user/SignInPage';
import AuthContext from '../../../context/UserContext';

const Header = () => {
  const { isLoggedIn, onLogout } = useContext(AuthContext);
  const [openModalName, setOpenModalName] = useState(null); // 'login', 'search' 등
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const logoImageUrl = './logo1.png';

  return (
    <>
      <header id='header' className={`${styles.header} ${styles.main}`}>
        <div className={styles.header_wrap}>
          <div className={styles.header_bottom}>
            <div className={styles.cont_inner}>
              <strong className={styles.logo}>
                <Link to='/'>
                  <img src={logoImageUrl} alt='아트로그 사이트 로고' />
                </Link>
              </strong>

              <nav className={styles.header_navi}>
                <ul>
                  <li>
                    <Link to='/exhibitions'>전시 정보</Link>
                  </li>
                  <li>
                    <Link to='/reviews'>리뷰</Link>
                  </li>
                  {isLoggedIn && (
                    <li>
                      <Link to='/mypage'>마이페이지</Link>
                    </li>
                  )}
                </ul>
              </nav>

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
                      <Link to='/signup'>SIGNUP</Link>
                    </>
                  )}
                </div>

                <button
                  onClick={toggleSearchModal}
                  type='button'
                  className={styles.btn_search}
                  aria-label='검색'
                >
                  {isSearchOpen ? <FaTimes /> : <FaSearch />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 검색 모달 */}
      <HeaderSearchModal
        isOpen={openModalName === 'search'}
        onClose={closeModal}
      />

      {/* 로그인 모달 */}
      {openModalName === 'login' && <SignInPage onClose={closeModal} />}
    </>
  );
};

export default Header;
