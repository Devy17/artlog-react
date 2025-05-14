// // src/pages/UserCouponPage.jsx
// // 파일명을 실제 사용하는 이름으로 맞춰주세요.

// import React, { useContext, useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthContext from '../../context/UserContext'; // AuthContext 파일 경로 확인 필요
// import { API_BASE_URL, USER } from '../../Axios/host-config'; // API 경로 확인 필요
// import styles from './UserCouponPage.module.scss'; // ✅ SCSS 파일명 확인
// import axios from "axios";

// const UserCouponPage = () => {
//   const navigate = useNavigate();
//   const authCtx = useContext(AuthContext);

//   const [serialNumber, setSerialNumber] = useState('');
//   const [couponList, setCouponList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const loggedInUserId = localStorage.getItem("USER_ID");
//   const userKeyForInsert = loggedInUserId;


//   // 쿠폰 목록 가져오기 함수: 백엔드 응답 형식 처리 강화
//   const fetchCoupons = useCallback(async () => {
//     // API 호출 전에 토큰과 사용자 ID 유효성 확인
//     const token = localStorage.getItem("ACCESS_TOKEN");
//     const userId = localStorage.getItem("USER_ID");

//     if (!token || !userId) {
//       setLoading(false);
//       setError("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
//       return; // 유효하지 않으면 API 호출 중단
//     }

//     setLoading(true); // 로딩 시작
//     setError(null); // 이전 오류 초기화

//     try {
//       const response = await axios.get(`${API_BASE_URL}${USER}/findCouponById/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // 백엔드 응답 형식 처리 강화 (2xx 상태 코드 응답 시)
//       if (response.status >= 200 && response.status < 300) {
//         const data = response.data;
//         const httpStatus = response.status;

//         // 1. CommonResDto 형식인지 확인 (statusCode 필드 존재 여부)
//         if (data && data.statusCode !== undefined) {
//           // CommonResDto 형식인 경우 statusCode 값으로 비즈니스 로직 성공/실패 판단
//           if (data.statusCode === 200) {
//             // ✅ 성공적으로 CommonResDto 형식으로 데이터를 받음 (statusCode 200)
//             const couponListData = Array.isArray(data.result) ? data.result : []; // result가 배열인지 확인
//             setCouponList(couponListData);
//             setError(null); // 성공 시 오류 메시지 초기화

//             if (data.statusMessage !== undefined) {
//               console.log("쿠폰 목록 가져오기 성공 (CommonResDto 200):", data.statusMessage);
//             }

//           } else {
//             // ✅ CommonResDto 형식인데 statusCode가 200이 아닌 경우 (백엔드 비즈니스 로직 오류)
//             const backendStatusCode = data.statusCode;
//             const backendStatusMessage = (data.statusMessage !== undefined) ? data.statusMessage : `메시지 없음 (코드: ${backendStatusCode})`;

//             // ✅ console.error와 setError에 안전하게 접근하도록 수정
//             console.error("쿠폰 목록 가져오기 실패 - 백엔드 오류 응답 (CommonResDto 형식):", httpStatus, backendStatusCode, backendStatusMessage, data);
//             setError(`쿠폰 목록 가져오기 실패: ${backendStatusMessage} (상태: ${httpStatus}, 코드: ${backendStatusCode})`);
//             setCouponList([]); // 오류 발생 시 목록 비움
//           }

//         } 
//       } else {
//         // 이 else 블록은 Axios가 2xx가 아닌 상태 코드에 대해 에러를 던지므로 거의 실행되지 않음
//         const httpStatus = response.status;
//         console.error("쿠폰 목록 가져오기 실패 - 예상치 못한 HTTP 응답 상태:", httpStatus, response.data);
//         setError(`쿠폰 목록을 가져오는데 실패했습니다: 예상치 못한 HTTP 상태 (${httpStatus})`);
//         setCouponList([]);
//       }

//     } catch (err) {
//       // 이 catch 블록은 2xx가 아닌 HTTP 상태 코드 (4xx, 5xx, 네트워크 오류 등) 발생 시 실행
//       console.error("Error fetching coupon list (non-2xx HTTP status):", err);
//       if (err.response) {
//         const httpStatus = err.response.status;
//         console.error("쿠폰 목록 가져오기 실패 - HTTP 응답 상세:", httpStatus, err.response.data);

//         // 백엔드 응답 데이터(err.response.data)에 statusMessage가 있는지 확인 후 사용
//         const backendErrorMessage = (err.response.data && err.response.data.statusMessage !== undefined) ? err.response.data.statusMessage : '서버 응답 오류';
//         const backendStatusCodeInBody = (err.response.data && err.response.data.statusCode !== undefined) ? err.response.data.statusCode : 'N/A'; // body 안의 코드도 확인

//         // 401/403 오류 시 로그아웃 처리 (MyPage와 동일 로직)
//         if (httpStatus === 401 || httpStatus === 403) {
//           alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
//           authCtx.onLogout();
//           navigate('/login');
//         } else {
//           // 그 외의 non-2xx 오류 (400, 404, 500 등)
//           setError(`쿠폰 목록 가져오기 실패: ${backendErrorMessage} (상태: ${httpStatus}, 코드: ${backendStatusCodeInBody})`);
//         }
//       } else {
//         // 네트워크 오류 또는 요청 설정 오류 등
//         setError('네트워크 오류로 쿠폰 목록을 가져올 수 없습니다.');
//       }
//       setCouponList([]); // 오류 발생 시 목록 비움
//     } finally {
//       setLoading(false); // 로딩 완료
//     }
//   }, [authCtx, loggedInUserId, navigate, setLoading, setError, setCouponList]);


//   // --- Effect: 컴포넌트 마운트 시 사용자의 쿠폰 목록 가져오기 ---
//   useEffect(() => {
//     // 컴포넌트 마운트 시 초기 인증 정보 확인 및 목록 가져오기 함수 호출
//     const token = localStorage.getItem("ACCESS_TOKEN");
//     const userId = localStorage.getItem("USER_ID");

//     if (!token || !userId) {
//       console.log("CouponPage Mount: Authentication info missing. Redirecting.");
//       setLoading(false);
//       setError("로그인이 필요합니다."); // 오류 메시지 설정
//       alert('로그인이 필요한 페이지입니다.'); // 사용자에게 알림
//       authCtx.onLogout();
//       navigate('/login'); // 로그인 페이지로 리다이렉트
//       return; // API 호출 중단
//     }

//     fetchCoupons(); // 외부의 fetchCoupons 함수 호출

//   }, [authCtx, loggedInUserId, navigate, fetchCoupons]); // 의존성 배열


//   // --- 핸들러: 쿠폰 일련번호 입력 필드 값 변경 ---
//   const handleSerialNumberChange = (e) => {
//     setSerialNumber(e.target.value);
//     setError(null); // 입력 시작 시 오류 메시지 초기화
//   };


//   // --- 핸들러: 쿠폰 등록 폼 제출 ---
//   // 백엔드 응답 형식이 CommonResDto가 아닐 경우에도 오류 메시지 처리가 견고하도록 수정
//   const handleRegisterCoupon = async (e) => {
//     e.preventDefault(); // 폼 기본 제출 동작 방지

//     // 클라이언트 측 유효성 검사
//     if (!serialNumber.trim()) {
//       setError("쿠폰 번호를 입력해주세요.");
//       return;
//     }
//     // API 호출 전에 토큰과 사용자 ID 유효성 확인
//     const token = localStorage.getItem("ACCESS_TOKEN");
//     const userId = localStorage.getItem("USER_ID"); // 함수 안에서 다시 가져와 사용
//     if (!token || !userId) {
//       setError("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
//       alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
//       authCtx.onLogout();
//       navigate('/login');
//       return; // 유효하지 않으면 API 호출 중단
//     }


//     setLoading(true); // 등록 로딩 시작
//     setError(null); // 이전 오류 초기화

//     // 명세: POST /user/couponInsert, 요청 Body: { userKey, serialNumber }
//     const registrationData = {
//       userKey: userKeyForInsert, // userKey로 사용자 ID 사용
//       serialNumber: serialNumber.trim(), // 입력된 쿠폰 번호 (앞뒤 공백 제거)
//     };

//     try {
//       const response = await axios.post(`${API_BASE_URL}${USER}/couponInsert`, registrationData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // ✅ 백엔드 응답 형식 처리 강화 (2xx 상태 코드 응답 시)
//       if (response.status >= 200 && response.status < 300) {
//         const data = response.data;
//         const httpStatus = response.status;

//         // CommonResDto 형식인지 확인 (statusCode 필드 존재 여부)
//         if (data && data.statusCode !== undefined) {
//           // CommonResDto 형식인 경우, statusCode 값으로 비즈니스 로직 성공/실패 판단
//           if (data.statusCode === 200) {
//             // ✅ 등록 성공 (statusCode 200)
//             alert(data.statusMessage || '쿠폰이 성공적으로 등록되었습니다.');
//             setSerialNumber(''); // 입력 필드 비우기
//             await fetchCoupons(); // 목록 새로고침

//           } else {
//             // ✅ CommonResDto 형식인데 statusCode가 200이 아닌 경우 (백엔드 비즈니스 로직 오류)
//             const backendStatusCode = data.statusCode;
//             const backendStatusMessage = (data.statusMessage !== undefined) ? data.statusMessage : `메시지 없음 (코드: ${backendStatusCode})`;

//             // ✅ console.error와 setError에 안전하게 접근하도록 수정
//             console.error("쿠폰 등록 실패 - 백엔드 비즈니스 오류 (CommonResDto 형식):", httpStatus, backendStatusCode, backendStatusMessage, data);

//             // 오류 메시지 설정: 백엔드 메시지 또는 기본 메시지
//             setError(`쿠폰 등록 실패: ${backendStatusMessage} (상태: ${httpStatus}, 코드: ${backendStatusCode})`);

//             // 특정 statusCode에 대한 추가 처리 (예: 404 Not Found)
//             if (backendStatusCode === 404) {
//               console.log("쿠폰 등록 - 해당 쿠폰 번호 없음 (404)");
//             }
//             // TODO: 필요한 다른 비즈니스 오류 코드 (400 등)에 대한 특정 처리 추가 가능

//           }

//         } else {
//           // ✅ 백엔드가 2xx 상태 코드로 응답했지만 CommonResDto 형식이 아닌 경우 (statusCode 필드 없음)
//           const httpStatus = response.status;
//           console.error("쿠폰 등록 실패 - 예상치 못한 2xx 응답 형식:", httpStatus, data);
//           setError(`쿠폰 등록 실패: 예상치 못한 서버 응답 형식 (상태: ${httpStatus})`);
//           // 이 경우 등록은 성공했을 수 있으나, 형식을 확신할 수 없어 목록 업데이트는 fetchCoupons에서 처리됨
//         }

//       } else {
//         // 이 else 블록은 실행될 가능성이 낮음 (Axios는 non-2xx에 대해 catch로 이동)
//         const httpStatus = response.status;
//         console.error("쿠폰 등록 실패 - 예상치 못한 HTTP 응답 상태:", httpStatus, response.data);
//         setError(`쿠폰 등록 실패: 예상치 못한 HTTP 상태 (${httpStatus})`);
//       }


//     } catch (err) {
//       // 이 catch 블록은 2xx가 아닌 HTTP 상태 코드 (4xx, 5xx, 네트워크 오류 등) 발생 시 실행
//       console.error("Error registering coupon (non-2xx HTTP status):", err);
//       if (err.response) {
//         const httpStatus = err.response.status;
//         console.error("쿠폰 등록 실패 - HTTP 응답 상세:", httpStatus, err.response.data);

//         // 백엔드 응답 데이터(err.response.data)에 statusMessage가 있는지 확인 후 사용
//         const backendErrorMessage = (err.response.data && err.response.data.statusMessage !== undefined) ? err.response.data.statusMessage : '서버 응답 오류';
//         const backendStatusCodeInBody = (err.response.data && err.response.data.statusCode !== undefined) ? err.response.data.statusCode : 'N/A'; // body 안의 코드도 확인


//         // 401/403 오류 시 로그아웃 처리 (MyPage와 동일 로직)
//         if (httpStatus === 401 || httpStatus === 403) {
//           alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
//           authCtx.onLogout();
//           navigate('/login');
//         } else {
//           // 그 외의 non-2xx 오류 (400, 404, 500 등)
//           setError(`쿠폰 등록 실패: ${backendErrorMessage} (상태: ${httpStatus}, 코드: ${backendStatusCodeInBody})`);
//         }
//       } else {
//         // 네트워크 오류 또는 요청 설정 오류 등
//         setError('네트워크 오류로 쿠폰 등록에 실패했습니다.');
//       }
//     } finally {
//       setLoading(false); // 로딩 완료
//     }
//   };


//   // --- JSX: 페이지 UI 렌더링 ---
//   return (
//     <div className={styles['coupon-page-wrapper']}>
//       <div className={styles['coupon-container']}>
//         <h2>쿠폰 조회 및 등록</h2>

//         {/* 쿠폰 등록 섹션 */}
//         <section className={styles['coupon-registration-section']}>
//           <h3>쿠폰 등록하기</h3>
//           <form className={styles['registration-form']} onSubmit={handleRegisterCoupon}>
//             <div className={styles['form-group']}>
//               <label htmlFor="serialNumber">쿠폰 번호 입력</label>
//               <input
//                 type="text"
//                 id="serialNumber"
//                 value={serialNumber}
//                 onChange={handleSerialNumberChange}
//                 required
//                 placeholder="쿠폰 일련번호를 입력하세요"
//               />
//             </div>
//             <button type="submit" className={styles['register-button']}>
//               쿠폰 등록
//             </button>
//           </form>
//         </section>

//         <hr className={styles['divider']} />

//         {/* 나의 쿠폰 목록 섹션 */}
//         <section className={styles['coupon-list-section']}>
//           <h3>나의 쿠폰 목록</h3>

//           {/* 로딩, 오류, 목록 결과에 따른 조건부 렌더링 */}
//           {loading ? (
//             <p className={styles['info-message']}>처리 중...</p>
//           ) : couponList.length === 0 ? ( // 로딩이 끝나고 목록이 비어있으면
//             <p>등록된 쿠폰이 없습니다.</p>
//           ) : ( // 로딩 중이 아니고 목록이 비어있지 않으면
//             <ul className={styles['coupon-list']}>
//               {couponList.map(coupon => (
//                 <li key={coupon.id} className={styles['coupon-item']}>
//                   {/* 명세 필드 표시 (userKey는 표시하지 않음) */}
//                   <p><strong>쿠폰 ID:</strong> {coupon.id}</p> {/* user_coupons.id */}
//                   <p><strong>쿠폰 종류:</strong> {coupon.couponKey}</p> {/* user_coupons.coupon_key (coupon type ID) */}
//                   <p><strong>등록일:</strong> {coupon.registDate ? new Date(coupon.registDate).toLocaleDateString() : '날짜 정보 없음'}</p> {/* user_coupons.regist_date */}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//         {/* 로딩 또는 오류 메시지를 섹션 아래 통합하여 표시 */}
//         {!loading && error && <p className={styles['error-message']}>{error}</p>}



//       </div>
//     </div>
//   );
// };

// export default UserCouponPage;