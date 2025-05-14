// src/Modal/FindMyPWModal.jsx
import React, { useState, useContext } from 'react';
import styles from './FindMyPWModal.module.scss';
import ModalContext from '../ModalContext';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const FindMyPWModal = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFindPW = async () => {
    if (!userId || !email) {
      setError('아이디와 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${USER}/findByUserIdAndEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      const data = await res.json();

      if (res.status === 200 && data.statusCode === 200) {
        localStorage.setItem('findPWUserId', userId);
        localStorage.setItem('findPWEmail', email);
        setModalType('insertHint_findPW');
      } else {
        setError(data.statusMessage || '가입된 정보가 존재하지 않습니다.');
      }
    } catch (err) {
      console.error('비밀번호 찾기 요청 실패:', err);
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>비밀번호 찾기</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <h3 className={styles.question}>비밀번호를 잊으셨나요?</h3>
          <p className={styles.subtext}>
            회원가입 시 입력하신 <strong>아이디와 이메일</strong>을
            입력해주세요.
          </p>

          <div className={styles.userIdGroup}>
            <label htmlFor='userId'>아이디</label>
            <input
              id='userId'
              type='text'
              placeholder='아이디 입력'
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.emailGroup}>
            <label htmlFor='email'>이메일</label>
            <input
              id='email'
              type='email'
              placeholder='이메일 입력'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.confirmBtn} onClick={handleFindPW}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindMyPWModal;
