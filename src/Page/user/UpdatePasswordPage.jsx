import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext'; // AuthContext 경로 확인
import axios from 'axios';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './UpdatePasswordPage.module.scss';
// import AuthContext from '../../context/UserContext'; // ✅ 이 줄은 중복되므로 제거

const UpdatePasswordPage = () => {
    const navigate = useNavigate();
    // ✅ useContext 호출은 컴포넌트 함수 최상단에 위치해야 합니다.
    const { onLogout } = useContext(AuthContext); // <-- 이 줄이 여기에 있어야 합니다.

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const loggedInUserId = localStorage.getItem("USER_ID"); // URL에 사용


    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        // ✅ useContext 호출은 여기서 제거합니다.
        // const { onLogout } = useContext(AuthContext); // ✅ 이 줄은 제거


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


        // 현재 비밀번호를 payload에 포함해야 하는지는 백엔드 API 명세 확인 필요
        const payload = {
             // currentPassword: currentPassword, // 백엔드 필요시 추가
             password: newPassword, // 새 비밀번호
        };


        const token = localStorage.getItem("ACCESS_TOKEN");
        // 토큰이 없으면 요청 보내지 않고 로그인 페이지로 리다이렉트
        if (!token) {
             alert('로그인이 필요합니다.');
             // ✅ onLogout 함수는 이제 컴포넌트 스코프에 정의되어 있으므로 바로 사용 가능
             onLogout();
             navigate('/login');
             return;
        }

        console.log('로그인한 유저 ID (URL에 사용):', loggedInUserId);
        console.log('현재 비밀번호 (입력값):', currentPassword); // 이 값은 백엔드 DTO로 전달 안될 수 있음
        console.log('새 비밀번호 (입력값, payload의 password로 전송):', newPassword);
        console.log('전송 payload:', payload);


        try {
            // ✅ useContext 호출은 여기서도 제거합니다.
            // const { onLogout } = useContext(AuthContext); // ✅ 이 줄은 제거

            const response = await axios.post(
                `${API_BASE_URL}${USER}/updatePw/${loggedInUserId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.statusCode === 200) {
                alert(response.data.statusMessage || '비밀번호가 성공적으로 변경되었습니다. | 로그인 페이지로 이동합니다.');

                // ✅ 비밀번호 변경 성공 시 로그아웃 처리
                // onLogout 함수는 컴포넌트 최상단에 정의되었으므로 여기서 바로 사용 가능
                onLogout();
                // ✅ 로그인 페이지로 이동
                navigate('/login');


            } else if (response.data && response.data.statusCode !== undefined) {
                 console.error("비밀번호 변경 실패 - 백엔드 비즈니스 오류 응답:", response.data);
                 setErrorMessage(response.data.statusMessage || '비밀번호 변경 중 오류 발생 (백엔드).');
            }

        } catch (error) {
            console.error("비밀번호 변경 요청 중 오류 발생:", error);

            if (error.response) {
                console.error("비밀번호 변경 실패 - HTTP 응답 상세:", error.response.status, error.response.data);
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';

                if (error.response.status === 401 || error.response.status === 403) {
                    alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                    // ✅ 오류 발생 시에도 로그아웃 및 리다이렉트 처리
                    // onLogout 함수는 컴포넌트 최상단에 정의되었으므로 여기서 바로 사용 가능
                    onLogout();
                    navigate('/login');

                } else if (error.response.status === 400) {
                    setErrorMessage(backendErrorMessage || '잘못된 요청 또는 유효성 검사 오류입니다.');
                } else if (error.response.status === 404) {
                     setErrorMessage(backendErrorMessage || '사용자를 찾을 수 없습니다.');
                 }
                else {
                    setErrorMessage(`비밀번호 변경 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
                }
            } else if (error.request) {
                setErrorMessage('네트워크 오류로 비밀번호 변경에 실패했습니다.');
            } else {
                setErrorMessage('요청 설정 중 오류가 발생했습니다.');
            }
        }
    };

    return (
      <div className={styles["update-container"]}>
        <h2>비밀번호 변경</h2>

        <form onSubmit={handlePasswordUpdate}>
           {/* 현재 비밀번호 입력 필드 - 백엔드 명세에 따라 필요 여부 확인 필요 */}
           <div className={styles["form-group"]}>
             <label htmlFor="current-password">현재 비밀번호</label>
             <input
               id="current-password"
               type="password"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               required
             />
           </div>

         <div className={styles["form-group"]}>
           <label htmlFor="new-password">새 비밀번호</label>
           <input
             id="new-password"
             type="password"
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             required
           />
         </div>

         <div className={styles["form-group"]}>
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
