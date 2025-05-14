// src/pages/UserCouponPage.jsx  (파일명에 User 붙여서 맞추겠습니다. 필요시 수정)

import React, { useContext, useState, useEffect, useCallback } from 'react'; // useCallback 임포트
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext'; // AuthContext 파일 경로 확인 필요
import { API_BASE_URL, USER } from '../../Axios/host-config'; // API 경로 확인 필요
import styles from './UserCouponPage.module.scss'; // ✅ SCSS 파일명 확인 (MyPage와 다른 이름)
import axios from "axios";

const CouponPage = () => {
    const navigate = useNavigate();
    // ✅ AuthContext에서 authCtx를 가져와 로그아웃 처리 등에 사용합니다.
    const authCtx = useContext(AuthContext);

    const [serialNumber, setSerialNumber] = useState('');
    const [couponList, setCouponList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 사용자 ID는 로컬 스토리지에서 가져옵니다.
    const loggedInUserId = localStorage.getItem("USER_ID");
    // 쿠폰 등록 시 userKey로 사용될 값 (사용자 ID와 동일하다고 가정)
    const userKeyForInsert = loggedInUserId;


    // ✅ fetchCoupons 함수 정의를 useEffect 바깥으로 이동하고 useCallback으로 감쌉니다.
    // ✅ 함수 안에서 토큰을 가져오고 Authorization 헤더를 포함시킵니다.
    const fetchCoupons = useCallback(async () => {
        // ✅ API 호출 전에 토큰과 사용자 ID 유효성 확인
        const token = localStorage.getItem("ACCESS_TOKEN");
        const userId = localStorage.getItem("USER_ID"); // 함수 안에서 다시 가져와 사용
        
        if (!token || !userId) {
            setLoading(false);
            setError("사용자 인증 정보가 없습니다.");
            // 비로그인 처리 및 리다이렉트는 아래 useEffect와 catch 블록에서 수행
            return; // 유효하지 않으면 API 호출 중단
        }

        setLoading(true); // 로딩 시작
        setError(null); // 이전 오류 초기화

        try {
            // 명세: GET /user/findCouponById/{id}
            const response = await axios.get(`${API_BASE_URL}${USER}/findCouponById/${userId}`, { // ✅ userId 사용
                // ✅ Authorization 헤더 포함
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.statusCode === 200) {
                const coupons = response.data.result;
                setCouponList(Array.isArray(coupons) ? coupons : []);
            } else {
                console.error("쿠폰 목록 가져오기 실패 - 백엔드 오류:", response.data.statusCode, response.data.statusMessage);
                setError(response.data.statusMessage || '쿠폰 목록을 가져오는데 실패했습니다.');
                 setCouponList([]);
            }
        } catch (err) {
            console.error("Error fetching coupon list:", err);
             if (err.response) {
                 console.error("쿠폰 목록 가져오기 실패 - HTTP 응답:", err.response.status, err.response.data);
                 const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : '서버 오류';

                 // ✅ 401/403 오류 시 로그아웃 처리 (MyPage와 동일 로직)
                 if (err.response.status === 401 || err.response.status === 403) {
                     alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                     authCtx.onLogout(); // 로그아웃 처리
                     navigate('/login'); // 로그인 페이지로 리다이렉트
                 } else {
                     setError(`쿠폰 목록 가져오기 실패: ${backendErrorMessage} (상태: ${err.response.status})`);
                 }
             } else {
                 setError('네트워크 오류로 쿠폰 목록을 가져올 수 없습니다.');
             }
            setCouponList([]);
        } finally {
            setLoading(false); // 로딩 완료
        }
    }, [authCtx, loggedInUserId, navigate, setLoading, setError, setCouponList]); // ✅ useCallback의 의존성 배열에 authCtx, navigate 추가


    // --- Effect: 컴포넌트 마운트 시 사용자의 쿠폰 목록 가져오기 ---
    useEffect(() => {
        // 컴포넌트 마운트 시 초기 인증 정보 확인 및 목록 가져오기 함수 호출
        const token = localStorage.getItem("ACCESS_TOKEN");
        const userId = localStorage.getItem("USER_ID");

        if (!token || !userId) {
            console.log("CouponPage Mount: Authentication info missing. Redirecting.");
             setLoading(false); // 로딩 상태 해제
             setError("로그인이 필요합니다."); // 오류 메시지 설정
             alert('로그인이 필요한 페이지입니다.'); // 사용자에게 알림
            authCtx.onLogout(); // 로그아웃 처리
            navigate('/login'); // 로그인 페이지로 리다이렉트
            return; // API 호출 중단
        }

        // ✅ 외부의 fetchCoupons 함수 호출 (useCallback 적용됨)
        fetchCoupons();

        // 의존성 배열: authCtx, loggedInUserId, navigate, fetchCoupons
        // fetchCoupons 함수 자체가 useCallback에 의해 메모이제이션되므로 의존성 배열에 포함시킵니다.
    }, [authCtx, loggedInUserId, navigate, fetchCoupons]);


    // --- 핸들러: 쿠폰 일련번호 입력 필드 값 변경 ---
    const handleSerialNumberChange = (e) => {
        setSerialNumber(e.target.value);
        setError(null); // 입력 시작 시 오류 메시지 초기화
    };


    // --- 핸들러: 쿠폰 등록 폼 제출 ---
    // ✅ 함수 안에서 토큰을 가져오고 Authorization 헤더를 포함시킵니다.
    const handleRegisterCoupon = async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // 클라이언트 측 유효성 검사
        if (!serialNumber.trim()) {
            setError("쿠폰 번호를 입력해주세요.");
            return;
        }
        // ✅ API 호출 전에 토큰과 사용자 ID 유효성 확인
         const token = localStorage.getItem("ACCESS_TOKEN");
         const userId = localStorage.getItem("USER_ID"); // 함수 안에서 다시 가져와 사용
         if (!token || !userId) {
             setError("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
             alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
             authCtx.onLogout(); // 로그아웃 처리
             navigate('/login'); // 로그인 페이지로 리다이렉트
             return; // 유효하지 않으면 API 호출 중단
         }


        setLoading(true); // 등록 로딩 시작 (loading 상태를 등록과 조회 모두에 사용)
        setError(null); // 이전 오류 초기화

        // 명세: POST /user/couponInsert, 요청 Body: { userKey, serialNumber }
        const registrationData = {
            userKey: userKeyForInsert, // userKey로 사용자 ID 사용
            serialNumber: serialNumber.trim(), // 입력된 쿠폰 번호 (앞뒤 공백 제거)
        };

        try {
            const response = await axios.post(`${API_BASE_URL}${USER}/couponInsert`, registrationData, {
                // ✅ Authorization 헤더 포함
                 headers: {
                     Authorization: `Bearer ${token}`,
                 },
            });

             // 백엔드 응답 구조가 CommonResDto { statusCode, statusMessage, result } 형태라고 가정
             if (response.data && response.data.statusCode === 200) {
                 alert(response.data.statusMessage || '쿠폰이 성공적으로 등록되었습니다.');
                 setSerialNumber(''); // 등록 성공 후 입력 필드 비우기

                 // ✅ 등록 성공 후 fetchCoupons 함수 호출하여 목록 다시 가져오기
                 await fetchCoupons(); // await 사용하여 목록 업데이트 기다림

             } else if (response.data && response.data.statusCode === 404) { // 명세: EntityNotFound(404)
                  setError(response.data.statusMessage || '해당 쿠폰 번호를 찾을 수 없습니다.');
             }
             else {
                 console.error("쿠폰 등록 실패 - 백엔드 비즈니스 오류:", response.data);
                 setError(response.data.statusMessage || '쿠폰 등록 중 오류가 발생했습니다.');
             }

        } catch (err) {
            console.error("Error registering coupon:", err);
             if (err.response) {
                 console.error("쿠폰 등록 실패 - HTTP 응답:", err.response.status, err.response.data);
                  const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : '서버 오류';

                  // ✅ 401/403 오류 시 로그아웃 처리 (MyPage와 동일 로직)
                  if (err.response.status === 401 || err.response.status === 403) {
                       alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                       authCtx.onLogout(); // 로그아웃 처리
                       navigate('/login'); // 로그인 페이지로 리다이렉트
                  } else if (err.response.status === 404) {
                       setError(backendErrorMessage || '해당 쿠폰 번호를 찾을 수 없습니다.');
                  } else if (err.response.status === 400) {
                       setError(backendErrorMessage || '잘못된 쿠폰 번호 형식 또는 이미 등록된 쿠폰입니다.');
                  }
                  else {
                       setError(`쿠폰 등록 실패: ${backendErrorMessage} (상태: ${err.response.status})`);
                  }
             } else {
                 setError('네트워크 오류로 쿠폰 등록에 실패했습니다.');
             }
        } finally {
            setLoading(false); // 로딩 완료
        }
    };


    // --- JSX: 페이지 UI 렌더링 ---
    return (
        <div className={styles['coupon-page-wrapper']}>
            {/* JSX 구조는 이전과 동일 */}
             <div className={styles['coupon-container']}>
                <h2>쿠폰 조회 및 등록</h2>

                {/* 쿠폰 등록 섹션 */}
                <section className={styles['coupon-registration-section']}>
                    <h3>쿠폰 등록하기</h3>
                    <form className={styles['registration-form']} onSubmit={handleRegisterCoupon}>
                        <div className={styles['form-group']}>
                            <label htmlFor="serialNumber">쿠폰 번호 입력</label>
                            <input
                                type="text"
                                id="serialNumber"
                                value={serialNumber}
                                onChange={handleSerialNumberChange}
                                required
                                placeholder="쿠폰 일련번호를 입력하세요"
                            />
                        </div>
                        <button type="submit" className={styles['register-button']}>
                            쿠폰 등록
                        </button>
                    </form>
                     {/* 로딩 및 오류 메시지 표시 영역 */}
                </section>

                <hr className={styles['divider']} />

                {/* 나의 쿠폰 목록 섹션 */}
                <section className={styles['coupon-list-section']}>
                    <h3>나의 쿠폰 목록</h3>

                    {/* 로딩, 오류, 목록 결과에 따른 조건부 렌더링 */}
                    {loading ? (
                        <p className={styles['info-message']}>처리 중...</p>
                    ) : couponList.length === 0 ? ( // 로딩이 끝나고 목록이 비어있으면
                        <p>등록된 쿠폰이 없습니다.</p>
                    ) : (
                        // 쿠폰 목록이 있을 경우 표시
                        <ul className={styles['coupon-list']}>
                            {couponList.map(coupon => (
                                <li key={coupon.id} className={styles['coupon-item']}>
                                    {/* 명세 필드 표시 */}
                                    <p><strong>쿠폰 ID:</strong> {coupon.id}</p>
                                    <p><strong>쿠폰 종류:</strong> {coupon.couponKey}</p>
                                    {/* 날짜 포맷팅 */}
                                    <p><strong>등록일:</strong> {coupon.registDate ? new Date(coupon.registDate).toLocaleDateString() : '날짜 정보 없음'}</p>
                                </li>
                            ))}
                        </ul>
                        // 또는 테이블 형태 사용 가능
                    )}
                </section>
                 {/* 로딩 또는 오류 메시지를 섹션 아래 통합하여 표시 */}
                 {/* 로딩 중이 아닐 때만 오류 메시지 표시 */}
                 {!loading && error && <p className={styles['error-message']}>{error}</p>}
                 {/* 로딩 중일 때 로딩 메시지 표시 */}
                 {loading && <p className={styles['info-message']}>처리 중...</p>}


            </div>
        </div>
    );
};

export default CouponPage;