// src/Modal/FindMyIDModal.jsx
import React, { useState, useContext } from 'react';
import styles from './FindMyIDModal.module.scss';
import ModalContext from '../ModalContext';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const FindMyIDModal = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFindID = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${USER}/findByHintKey?email=${email}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      if (response.status === 200) {
        localStorage.setItem('findIDEmail', email); // 다음 모달에서 사용
        setModalType('insertHint_findID');
      } else {
        setError('가입된 이메일이 존재하지 않습니다.');
      }
    } catch (err) {
      console.error('힌트 요청 실패:', err);
      setError('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>아이디 찾기</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <h3 className={styles.question}>아이디를 잊으셨나요?</h3>
          <p className={styles.subtext}>
            회원가입 시 입력하신 <strong>이메일</strong>을 입력해주세요.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor='email'>이메일</label>
            <input
              id='email'
              type='email'
              placeholder='이메일 주소 입력'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.confirmBtn} onClick={handleFindID}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindMyIDModal;
