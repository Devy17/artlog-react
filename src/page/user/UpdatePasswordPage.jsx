import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../content/UserContext'; // 경로 확인
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './UpdatePasswordPage.module.scss'; 

const UpdatePasswordPage = () => {
    // const { user } = useContext(AuthContext); // user 객체 사용하지 않으면 제거 가능
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const loggedInUserId = localStorage.getItem("USER_ID"); // URL에 사용

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        // 클라이언트 측: 새 비밀번호 확인 일치 여부
        if (newPassword !== confirmPassword) {
            setErrorMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
          // 새 비밀번호 길이 검사
        if (newPassword.length < 8) {
          setErrorMessage('비밀번호는 최소 8자 이상이어야 합니다.');
          return;
        }

      // 새 비밀번호와 현재 비밀번호가 동일한 경우 방지
        if (currentPassword === newPassword) {
            setErrorMessage('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
            return;
        }

             const payload = {
                password: newPassword,
              };

        const token = localStorage.getItem("ACCESS_TOKEN");
        // 토큰이 없으면 요청 보내지 않거나 로그인 페이지로 리다이렉트하는 로직 추가 필요
        if (!token) {
             alert('로그인이 필요합니다.');
             // TODO: navigate('/login'); 또는 authCtx.onLogout() 호출
             return;
        }

        console.log('로그인한 유저 ID (URL에 사용):', loggedInUserId);
        console.log('현재 비밀번호 (입력값):', currentPassword); // 이 값은 백엔드 DTO로 전달 안될 수 있음
        console.log('새 비밀번호 (입력값, payload의 password로 전송):', newPassword);
        console.log('전송 payload:', payload);


        try {
            // ✅ HTTP 메소드를 백엔드 @PostMapping에 맞춰 axios.post로 변경
            const response = await axios.post(
                `${API_BASE_URL}${USER}/updatePw/${loggedInUserId}`, // userId는 Path Variable로 전달
                payload, // 변경된 payload 전송 { password: newPassword }
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Axios는 2xx 상태 코드를 성공으로 처리합니다.
            // 백엔드가 CommonResDto 형태로 응답을 보낸다면 response.data.statusCode, response.data.statusMessage를 확인합니다.
            if (response.data && response.data.statusCode === 200) { // 백엔드 성공 기준 확인 (CommonResDto 사용 시)
                alert(response.data.statusMessage || '비밀번호가 성공적으로 변경되었습니다.'); // 백엔드 성공 메시지 표시
                navigate('/mypage'); // 마이페이지로 이동
            } else if (response.data && response.data.statusCode !== 200) {
                 // 백엔드가 2xx HTTP 응답을 보냈으나 내부 비즈니스 로직 오류 (statusCode != 200)
                 console.error("비밀번호 변경 실패 - 백엔드 비즈니스 오류:", response.data);
                 setErrorMessage(response.data.statusMessage || '비밀랜드 변경 중 오류 발생 (백엔드).');
            }
            // Axios는 2xx 외 상태 코드는 catch 블록으로 에러를 던지므로 여기서는 처리하지 않아도 됩니다.

        } catch (error) {
            console.error("비밀번호 변경 요청 오류:", error);
            // ✅ 상세 오류 처리 추가 (Axios 에러)
            if (error.response) {
                // 서버가 응답을 보낸 경우 (4xx, 5xx HTTP 상태 코드)
                console.error("비밀번호 변경 실패 - HTTP 응답:", error.response.status, error.response.data);
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';

                if (error.response.status === 401 || error.response.status === 403) {
                    // 인증/권한 오류
                    alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                    // TODO: authCtx.onLogout(); navigate('/login'); 관련 로직 호출 필요
                } else if (error.response.status === 400) {
                    // 백엔드가 400 Bad Request를 보낸 경우 (예: 명세의 '기존 비밀번호와 동일')
                    // 이 경우 백엔드 DTO에 currentPassword가 없으므로 백엔드가 현재 비밀번호를 다른 방식으로 검증하고 있을 수 있습니다.
                    setErrorMessage(backendErrorMessage || '잘못된 요청 또는 유효성 검사 오류입니다.');
                } else if (error.response.status === 404) {
                    // 명세의 EntityNotFoundException(404) 처리
                     setErrorMessage('사용자를 찾을 수 없습니다.');
                }
                else {
                    // 기타 HTTP 오류
                    setErrorMessage(`비밀번호 변경 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
                }
            } else if (error.request) {
                // 요청은 보내졌으나 응답을 받지 못한 경우 (네트워크 오류 등)
                setErrorMessage('네트워크 오류로 비밀번호 변경에 실패했습니다.');
            } else {
                // 요청 설정 중 오류 발생
                setErrorMessage('요청 설정 중 오류가 발생했습니다.');
            }
        }
    };

    return (
      <div className={styles["update-container"]}>
        <h2>비밀번호 변경</h2>
    
        <form onSubmit={handlePasswordUpdate}>
          <div>
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
    
          <div>
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
    
          <div>
            <label htmlFor="confirm-password">비밀번호 확인</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
    
          <button type="submit" className={styles["submit-btn"]}>
            비밀번호 변경하기
          </button>
    
          {errorMessage && (
            <p className={styles["error-message"]}>{errorMessage}</p>
          )}
        </form>
      </div>
    );
};

export default UpdatePasswordPage;