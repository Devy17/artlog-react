// src/Modal/InsertHintModal_FindID.jsx
import React, { useEffect, useState, useContext } from 'react';
import styles from './InsertHintModal_FindID.module.scss';
import ModalContext from '../ModalContext';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const InsertHintModal_FindID = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);
  const [hintList, setHintList] = useState([]);
  const [selectedHintKey, setSelectedHintKey] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const email = localStorage.getItem('findIDEmail');

  // 힌트 목록 불러오기
  useEffect(() => {
    const fetchHints = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${USER}/hintKeys`);
        const data = await res.json();

        if (res.status === 200 && data.statusCode === 200) {
          setHintList(data.result);
        } else {
          console.error('힌트 목록 불러오기 실패:', data);
          setError('힌트 목록을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('힌트 요청 오류:', err);
        setError('네트워크 오류가 발생했습니다.');
      }
    };

    fetchHints();
  }, []);

  const handleSubmit = async () => {
    if (!selectedHintKey || !answer) {
      setError('힌트와 정답을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${USER}/verifyUserIdHint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          hintKey: parseInt(selectedHintKey),
          hintValue: answer,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        localStorage.setItem('foundUserId', data.result);
        setModalType('showID');
      } else {
        setError(data.statusMessage || '정답이 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('검증 요청 실패:', err);
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
          <p className={styles.subtext}>
            회원가입 시 설정한 힌트 질문과 정답을 입력해주세요.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor='hint'>힌트</label>
            <select
              id='hint'
              value={selectedHintKey}
              onChange={(e) => setSelectedHintKey(e.target.value)}
              className={styles.selectBox}
            >
              <option value=''>선택하세요</option>
              {hintList.map((hint) => (
                <option key={hint.code} value={hint.code}>
                  {hint.desc}
                </option>
              ))}
            </select>
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
            아이디 찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertHintModal_FindID;
