import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../content/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignInPage.module.scss';

const SignInPage = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  const doLogin = async () => {
    const loginData = {
      userId,
      password,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/login`, loginData);
      alert('로그인 성공!');
      onLogin(res.data.result);
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('로그인 실패입니다. 아이디 또는 비밀번호를 확인하세요!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>로그인</h2>
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
          <div className={styles.buttonGroup}>
            <button type='submit' className={styles.primaryBtn}>
              로그인
            </button>
            <button
              type='button'
              className={styles.secondaryBtn}
              onClick={() => navigate('/signUp')}
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
