// src/Modal/InsertHintModal.jsx
import React, { useState } from 'react';
import styles from './InsertHintModal.module.scss';

const InsertHintModal = ({ onClose, type }) => {
  const [hint, setHint] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!hint || !answer) {
      setError('힌트와 정답을 모두 입력해주세요.');
      return;
    }

    setError('');
    // TODO: 서버 검증 로직 추가 가능

    if (type === 'findID') {
      alert('아이디 찾기 성공! (show ID 모달로 이동)');
    } else if (type === 'findPW') {
      alert('비밀번호 재설정으로 이동!');
    }
    // 이후: setModalType('showID') 또는 setModalType('resetPW')
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {type === 'findID' ? '아이디 찾기' : '비밀번호 찾기'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <label htmlFor='hint'>힌트</label>
            <input
              id='hint'
              type='text'
              placeholder='힌트 입력'
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='answer'>정답</label>
            <input
              id='answer'
              type='text'
              placeholder='정답 입력'
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={styles.input}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.confirmBtn} onClick={handleSubmit}>
            {type === 'findID' ? '아이디 찾기' : '비밀번호 찾기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertHintModal;
