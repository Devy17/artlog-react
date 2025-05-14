import React, { useContext, useEffect, useState } from "react";
import styles from "./MyPage.module.scss"; // CSS 모듈 스타일 임포트
import axios from "axios"; // axios 라이브러리 임포트
import { API_BASE_URL, USER } from "../../Axios/host-config"; // API 기본 URL 및 사용자 관련 경로 임포트
import AuthContext from "../../context/UserContext"; // 사용자 인증 Context 임포트
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 임포트

const MyPage = () => {
  const navigate = useNavigate(); 
  const authCtx = useContext(AuthContext); 

  const loggedInUserId = localStorage.getItem("USER_ID");

  // 사용자 정보를 담을 상태 (API 응답 데이터 및 폼 입력 값)
  const [userInfo, setUserInfo] = useState([]);

  // 힌트 질문 목록 상태 (select 옵션용)
  const [hintKeysList, setHintKeysList] = useState([]); // { code: int, desc: string } 객체 배열 예상

  // 수정 모드 상태
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) return;
      try {
          const res = await axios.get(`${API_BASE_URL}${USER}/mypage/${loggedInUserId}`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          });
          if (res.status === 200) {
              const { userId, userName, phone, email, hintKey, hintValue } = res.data.result;
              setUserInfo({
                  userId,
                  userName,
                  phone,
                  email,
                  hintKey,
                  hintValue,
              });
          } else {
              console.error("회원 정보 가져오기 실패:", res.data);

          }
          if(res.statusCode === 200) {
              return console.log("회원 정보 가져오기 성공:", res.data);
          }
      } catch (error) {
          console.error("회원 정보 가져오기 실패:", error);
      }
    }
    getUserInfo();
  }, []);

  // ✅ 힌트 질문 목록 가져오기 (GET /user/hintKeys)
  const fetchHintKeys = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}${USER}/hintKeys`, // 힌트 키 목록 엔드포인트
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.statusCode === 200) {
        const hints = response.data.result;
        setHintKeysList(Array.isArray(hints) ? hints : []); // 배열인지 확인 후 상태 업데이트
      } else {
        console.error("힌트 키 가져오기 실패 - 백엔드 오류:", response.data.statusCode);
      }
    } catch (error) {
      console.error("힌트 키 가져오기 실패:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          authCtx.onLogout(); navigate("/login");
      } else {
          const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
          alert(`힌트 키 가져오기 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
      }
    }
  };

  // --- 초기 데이터 로딩 (useEffect) ---
  useEffect(() => {
    // 컴포넌트 마운트 시 인증 정보 확인 및 초기 데이터 로딩 함수 호출
    const token = localStorage.getItem("ACCESS_TOKEN");
    const userId = localStorage.getItem("USER_ID");

    if (!token || !userId) {
       console.log("MyPage Mount: Authentication info missing. Redirecting.");
       authCtx.onLogout(); navigate('/login'); return;
    }

    fetchHintKeys(); // 힌트 키 목록 로드

  }, [navigate, authCtx]); // 의존성 배열

  // --- 입력 필드 변경 핸들러 ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: name === "hintKey" ? parseInt(value) : value,
    }));
  };

  // --- 회원 정보 저장 (PUT) ---
  const handleSave = async () => {
    if (!editMode) return; // 수정 모드 아닐 때 저장 방지

    const token = localStorage.getItem("ACCESS_TOKEN");
    const userId = localStorage.getItem("USER_ID");

    if (!token || !userId) {
      alert("회원 정보가 유효하지 않습니다. 다시 로그인 해주세요.");
      authCtx.onLogout(); navigate("/login"); return;
    }

        // 전화번호 유효성 검사 (010-XXXX-XXXX)
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(userInfo.phone)) {
          alert("전화번호 형식을 확인해주세요. 예: 010-1234-5678");
          return;
        }
          // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userInfo.email)) {
            alert("이메일 형식을 확인해주세요.");
            return;
        }
         // 힌트 질문 선택 여부 검사
        if (!userInfo.hintKey) {
            alert("힌트 질문을 선택해주세요.");
            return;
        }
         // 힌트 답변 입력 여부 검사
        if (!userInfo.hintValue.trim()) {
            alert("힌트 답변을 입력해주세요.");
            return;
        }

    // UserUpdateReqDto에 맞춰 payload 구성 (hintKey, hintValue, email, phone)
    const payload = {
      hintKey: parseInt(userInfo.hintKey), // 힌트 키 파싱
      hintValue: userInfo.hintValue,
      email: userInfo.email,
      phone: userInfo.phone,
      // 필요한 경우 DTO 필드 추가
    };

    try {
      // axios.put 호출: URL (ID 포함), payload, headers 포함 config
      const response = await axios.put(
        `${API_BASE_URL}${USER}/update/${userId}`, // PUT 업데이트 URL (ID 포함)
        payload,
        { headers: { Authorization: `Bearer ${token}` } } // 인증 헤더 필수
      );

      if (response.data && response.data.statusCode === 200) {
        alert("회원 수정이 완료되었습니다.");
        setEditMode(false); // 수정 모드 해제
      } else {
        alert(`회원 수정을 실패했습니다.: ${response.data.statusMessage || "An unknown error occurred."}`);
      }
    } catch (error) {
      console.error("Failed to save info:", error);
      if (error.response) {
        alert("정보를 입력하세요.");
        console.error(`정보 저장을 실패 했습니다. Status: ${error.response.status}. ${error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : ''}`);
        if (error.response.status === 401 || error.response.status === 403) {
          authCtx.onLogout(); navigate("/login");
        }
      } else {
        alert("정보 저장 중 네트워크 또는 요청 오류 발생.");
      }
    }
  };

  // --- 회원 탈퇴 (DELETE) ---
  const handleDelete = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    const token = localStorage.getItem("ACCESS_TOKEN");
    const userId = localStorage.getItem("USER_ID");

    if (!token || !userId) {
      alert("Login information is invalid. Please log in again to delete.");
      authCtx.onLogout(); navigate("/login"); return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}${USER}/delete/${userId}`, // DELETE 탈퇴 URL (ID 포함)
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.statusCode === 200) {
        alert("회원 탈퇴가 완료되었습니다.");
        // 로컬 스토리지의 모든 인증 관련 정보 삭제
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("USER_ID");
        localStorage.removeItem("USER_ROLE"); // 역할 정보도 저장했다면 삭제

        authCtx.onLogout();
        navigate("/"); // 홈페이지 또는 로그인 페이지로 이동

      } else {
        alert(`Failed to delete account: ${response.data.statusMessage || "An unknown error occurred."}`);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
       if (error.response) {
         alert(`Failed to delete account. Status: ${error.response.status}. ${error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : ''}`);
         if (error.response.status === 401 || error.response.status === 403) {
           authCtx.onLogout(); navigate("/login");
         }
       } else {
         alert("회원 탈퇴 중 네트워크 또는 요청 오류 발생.");
       }
    }
  };

  // --- JSX 렌더링 (레이아웃 변경 반영) ---
  return (
    <div className={styles.mypage}>
      <h1 className={styles.title}>마이 페이지</h1>

      {/* 상단 네비게이션 버튼 그룹 */}
      {/* Flexbox나 Grid를 사용하여 버튼들을 가로로 배치하는 CSS 필요 */}
      <div className={styles.topButtonGroup}>
        <button className={styles.navButton}>비밀번호 변경</button>
        <button className={styles.navButton}>나의 리뷰</button>
        <button className={styles.navButton}>쿠폰 조회 및 등록</button>
        <button className={styles.navButton}>콘텐츠 조회 및 취소</button>
      </div>

      {/* 회원 정보 수정 섹션 (수정 가능 필드) */}
      {/* 이 섹션에 테두리, 배경색 등의 스타일을 적용하는 CSS 필요 */}
      <div className={styles.editableInfoSection}>
        <h2 className={styles.sectionTitle}>회원 정보 수정</h2> {/* 섹션 제목 */}
        {/* 회원 정보 수정 필드 그룹 */}
        <div className={styles.form}> {/* 기존 폼 클래스 재사용 또는 변경 */}
          <div className={styles.formItem}>
            <label htmlFor="phone">전화번호</label>
            <input id="phone" type="tel" name="phone" value={userInfo.phone} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className={styles.formItem}>
            <label htmlFor="email">이메일</label>
            <input id="email" type="email" name="email" value={userInfo.email} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className={styles.formItem}>
            <label htmlFor="hintKey">힌트 질문</label>
            <select id="hintKey" name="hintKey" value={userInfo.hintKey} onChange={handleChange} disabled={!editMode}>
              <option value="">선택하세요</option>
              {hintKeysList.map((hint) => (
                <option key={hint.code} value={hint.code}>{hint.desc}</option>
              ))}
            </select>
          </div>
          <div className={styles.formItem}>
            <label htmlFor="hintValue">힌트 답변</label>
            <input id="hintValue" type="text" name="hintValue" value={userInfo.hintValue} onChange={handleChange} disabled={!editMode} />
          </div>
        </div>
      </div>

      {/* 로그인 정보 섹션 (수정 불가 필드) */}
      {/* 이 섹션에도 스타일을 적용하여 구분하는 CSS 필요 */}
      <div className={styles.readOnlyInfoSection}>
         <h2 className={styles.sectionTitle}>로그인 정보</h2> {/* 섹션 제목 - 디자인에 따라 생략 가능 */}
         {/* 읽기 전용 필드 그룹 */}
         <div className={styles.form}> {/* 기존 폼 클래스 재사용 또는 변경 */}
           <div className={styles.formItem}>
             <label htmlFor="userId">아이디</label>
             <p id="userId" type="text">{userInfo.userId}</p>
           </div>
           <div className={styles.formItem}>
             <label htmlFor="userName">이름</label>
             <p id="userName" type="text" >{userInfo.userName}</p>
           </div>
         </div>
       </div>


      {/* 하단 액션 버튼 그룹 (저장, 회원 탈퇴) */}
      {/* Flexbox를 사용하여 자식 요소(버튼들)를 양쪽 끝으로 배치하는 CSS 필요 */}
      <div className={styles.bottomButtonContainer}>

        <button onClick={handleDelete} className={styles.deleteButton}>회원 탈퇴</button>
        {editMode ? (
          <button onClick={handleSave} className={styles.saveButton}>저장</button>
        ) : (
          <button onClick={() => setEditMode(true)} className={styles.editButton}>수정</button>
        )}
      </div>

    </div>
  );
};

export default MyPage;