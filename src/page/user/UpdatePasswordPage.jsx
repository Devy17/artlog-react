import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../content/UserContext';
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const UpdatePasswordPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const loggedInUserId = localStorage.getItem("USER_ID");

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // 새 비밀번호 확인 일치 여부
    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}${USER}/updatePw/${loggedInUserId}`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigate('/mypage');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('현재 비밀번호가 일치하지 않거나 변경에 실패했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>비밀번호 변경</h2>

      <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#0077ff', color: '#fff', border: 'none', borderRadius: '6px' }}>
          비밀번호 변경하기
        </button>

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default UpdatePasswordPage;
