import React, { useState, useContext } from 'react';
import styles from './NewPWModal.module.scss';
import ModalContext from '../ModalContext';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const NewPWModal = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);

  const [newPw, setNewPw] = useState('');
  const [checkPw, setCheckPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('pwResetUserId');
  console.log('🔎 pwResetUserId:', userId);

  const handleChangePW = async () => {
    setError('');
    setSuccess('');

    if (!newPw || !checkPw) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (newPw !== checkPw) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const userId = localStorage.getItem('pwResetUserId');
    console.log('userId:', userId);

    if (!userId) {
      setError('비정상적인 접근입니다. 다시 시도해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${USER}/updatePw/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPw }),
      });

      const data = await res.json();
      console.log('서버 응답: ', data);

      if (res.status === 200 && data.statusCode === 200) {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.');
        localStorage.removeItem('pwResetUserId');
      } else if (res.status === 400) {
        if (
          data.statusMessage ===
          '비밀번호는 대소문자 각각 1자 이상, 특수문자 1자 이상을 포함해야 합니다.'
        ) {
          setError(
            '비밀번호는 대소문자 각각 1자 이상, 특수문자 1자 이상을 포함해야 합니다.',
          );
        } else if (
          data.statusMessage === '비밀번호는 최소 8자 이상이어야 합니다.'
        ) {
          setError('비밀번호는 최소 8자 이상이어야 합니다.');
        } else if (data.statusMessage === '비밀번호는 필수입니다!') {
          setError('비밀번호는 필수입니다!');
        } else if (
          data.statusMessage ===
          '변경하려는 비밀번호가 이전 비밀번호와 동일합니다.'
        ) {
          setError('변경하려는 비밀번호가 이전 비밀번호와 동일합니다.');
        }
      } else if (res.status === 404) {
        setError('사용자를 찾을 수 없습니다.');
      } else {
        setError(data.statusMessage || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('서버에러: ', err);
      setError('서버 오류가 발생했습니다.');
      return;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>비밀번호 재설정</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.subtext}>변경할 새 비밀번호를 입력해 주세요.</p>
          <div className={styles.inputGroup}>
            <label htmlFor='newPw'>새 비밀번호</label>
            <input
              type='password'
              id='newPw'
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor='checkPw'>비밀번호 확인</label>
            <input
              type='password'
              id='checkPw'
              value={checkPw}
              onChange={(e) => setCheckPw(e.target.value)}
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          {!success ? (
            <button className={styles.confirmBtn} onClick={handleChangePW}>
              비밀번호 변경
            </button>
          ) : (
            <button
              className={styles.confirmBtn}
              onClick={() => setModalType('login')}
            >
              로그인 하러가기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPWModal;
