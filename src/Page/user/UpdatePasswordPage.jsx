import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './UpdatePasswordPage.module.scss';

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const { onLogout } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loggedInUserId = localStorage.getItem('USER_ID');

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    const payload = {
      password: newPassword,
    };

    const token = localStorage.getItem('ACCESS_TOKEN');

    if (!token) {
      onLogout();
      alert('로그아웃 되었습니다!');
      alert('다시 로그인 해주세요.');
      navigate('/');
      setModalType('login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${USER}/updatePw/${loggedInUserId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.statusCode === 200) {
        alert(
          response.data.statusMessage ||
            '비밀번호가 성공적으로 변경되었습니다.',
        );
        navigate('/');
      } else if (response.data?.statusCode !== undefined) {
        setErrorMessage(
          response.data.statusMessage || '비밀번호 변경 중 오류 발생 (백엔드).',
        );
      }
    } catch (error) {
      console.error('비밀번호 변경 요청 중 오류 발생:', error);

      if (error.response) {
        const backendErrorMessage =
          error.response.data?.statusMessage || '서버 오류';

        if (error.response.status === 401 || error.response.status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          onLogout();
          setModalType('login');
          navigate('/');
        } else if (error.response.status === 400) {
          setErrorMessage(backendErrorMessage || '유효성 검사 오류');
        } else if (error.response.status === 404) {
          setErrorMessage(backendErrorMessage || '사용자를 찾을 수 없습니다.');
        } else {
          setErrorMessage(
            `비밀번호 변경 실패: ${backendErrorMessage} (상태: ${error.response.status})`,
          );
        }
      } else if (error.request) {
        setErrorMessage('네트워크 오류로 비밀번호 변경에 실패했습니다.');
      } else {
        setErrorMessage('요청 설정 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles['update-container']}>
      <div className={styles.update_inner}>
        <h2>비밀번호 변경</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div className={styles['form-group']}>
            <label htmlFor='current-password'>현재 비밀번호</label>
            <input
              id='current-password'
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='new-password'>새 비밀번호</label>
            <input
              id='new-password'
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='confirm-password'>비밀번호 확인</label>
            <input
              id='confirm-password'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' className={styles['submit-btn']}>
            비밀번호 변경하기
          </button>

          {errorMessage && (
            <p className={styles['error-message']}>{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
