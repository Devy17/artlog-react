import React, { useContext, useState } from 'react';
import AuthContext from '../../content/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignInPage.module.scss';
import ModalContext from '../../Modal/ModalContext';

const SignInPage = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { onLogin } = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  const handleFindID = () => setModalType('findID');
  const handleFindPW = () => setModalType('findPW');

  const doLogin = async () => {
    const loginData = {
      userId,
      password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/login`, loginData);
      onLogin(res.data.result);
      onClose();
    } catch (e) {
      console.error(e);
      setErrorMessage('로그인 실패입니다. 아이디 또는 비밀번호를 확인하세요!');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
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
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='password'>비밀번호</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              onClick={() => setModalType('signUp')}
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
