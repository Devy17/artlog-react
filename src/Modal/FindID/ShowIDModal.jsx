import React, { useContext, useEffect, useState } from 'react';
import styles from './ShowIDModal.module.scss';
import ModalContext from '../ModalContext';

const ShowIDModal = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('foundUserId');
    console.log('저장된 ID:', userId);
    setUserId(userId);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        setModalType('login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>아이디 찾기 완료</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>회원님의 아이디는 다음과 같습니다.</p>
          <div className={styles.userIdBox}>
            {userId || '불러올 수 없습니다.'}
          </div>
          <button
            className={styles.confirmBtn}
            onClick={() => setModalType('login')}
          >
            로그인 하러가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowIDModal;
