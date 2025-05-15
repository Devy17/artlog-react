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

  const logoImageUrl =
    'https://sdmntprwestus3.oaiusercontent.com/files/00000000-6840-61fd-a3de-5417a740d6d2/raw?se=2025-05-09T07%3A24%3A18Z&sp=r&sv=2024-08-04&sr=b&scid=00000000-0000-0000-0000-000000000000&skoid=c953efd6-2ae8-41b4-a6d6-34b1475ac07c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-08T21%3A43%3A53Z&ske=2025-05-09T21%3A43%3A53Z&sks=b&skv=2024-08-04&sig=A5eRh3cNm1%2BY3fYX8xZwjsgFKvVY4j9eHuI%2B/3GULVs%3D';

  return (
    <>
      <header id='header' className={`${styles.header} ${styles.main}`}>
        <div className={styles.header_wrap}>
          <div className={styles.header_bottom}>
            <div className={styles.cont_inner}>
              <button
                type='button'
                className={styles.btn_menu}
                aria-label='전체 메뉴 열기'
              >
                <FaBars />
              </button>

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
