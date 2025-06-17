import React, { useContext, useState } from 'react';
import AuthContext from '../../context/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignInPage.module.scss';
import ModalContext from '../../Modal/ModalContext';
import { useNavigate } from 'react-router-dom';

const SignInPage = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  const handleFindID = () => {
    onClose();
    setTimeout(() => setModalType('findID'), 0);
  };

  const handleFindPW = () => {
    onClose();
    setTimeout(() => setModalType('findPW'), 0);
  };

  const doLogin = async () => {
    if (!userId.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const loginData = {
      userId,
      password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/login`, loginData);
      const { userId: id, role } = res.data.result;
      localStorage.setItem('USER_ID', id);
      localStorage.setItem('USER_ROLE', role);
      onLogin(res.data.result);
      onClose();
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>로그인</h2>
          <button type='button' className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doLogin();
          }}
          className={styles.form}
        >
          <div className={styles.formGroup}>
            <label htmlFor='userId'>아이디</label>
            <input
              type='text'
              id='userId'
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='password'>비밀번호</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}

          <div className={styles.helperGroup}>
            <button
              type='button'
              className={styles.helperBtn}
              onClick={handleFindID}
            >
              아이디 찾기
            </button>
            <button
              type='button'
              className={styles.helperBtn}
              onClick={handleFindPW}
            >
              비밀번호 찾기
            </button>
          </div>

          <div className={styles.buttonGroup}>
            <button type='submit' className={styles.primaryBtn}>
              로그인
            </button>
            <button
              type='button'
              className={styles.secondaryBtn}
              onClick={() => {
                onClose();
                navigate('/signUp');
              }}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
