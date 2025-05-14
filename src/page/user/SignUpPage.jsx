import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/UserContext";
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignUpPage.module.scss'; // SCSS 모듈 임포트
import axios from "axios"; // axios 임포트

const SignUpPage = () => {
    // 백엔드 UserInsertReqDto 구조에 맞춰 상태 정의
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hintKey, setHintKey] = useState(''); // Integer 값을 담을 것이지만 초기값은 비워둡니다.
    const [hintValue, setHintValue] = useState('');

    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // 힌트 키 목록 상태 (API 호출로 받아온 { code, desc } 객체 배열)
    const [hintKeysList, setHintKeysList] = useState([]);

    const navigate = useNavigate();
    // AuthContext는 default export이므로 useContext에 직접 전달
    const { isLoggedIn } = useContext(AuthContext);

    // 이미 로그인된 경우 회원가입 페이지 접근 시 메인 페이지로 리다이렉트
    useEffect(() => {
        if (isLoggedIn) {
            alert('이미 로그인된 상태입니다.');
            navigate('/', { replace: true });
        }
    }, [isLoggedIn, navigate]);


    // ✅ 힌트 키 목록 가져오기 (GET /user/hintKeys) - axios 사용
    useEffect(() => {
        const fetchHintKeys = async () => {
            // 회원가입 페이지에서는 인증 토큰이 필요 없을 것으로 예상하여 토큰 체크를 제거합니다.
            try {
                // axios.get 사용
                const response = await axios.get(`${API_BASE_URL}${USER}/hintKeys`);

                // Axios는 2xx 응답이 아니면 에러를 던지므로, 여기서는 2xx 응답 상태.
                // 백엔드 CommonResDto의 statusCode를 확인합니다.
                if (response.data && response.data.statusCode === 200) {
                    const hints = response.data.result;
                    setHintKeysList(Array.isArray(hints) ? hints : []); // 배열인지 확인 후 상태 업데이트
                } else {
                    // 백엔드 2xx 응답이나 비즈니스 로직 오류 (statusCode != 200)
                    console.error("힌트 키 가져오기 실패 - 백엔드 오류:", response.data.statusCode, response.data.statusMessage);
                    alert(`힌트 키 목록을 가져오는데 실패했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
                }
            } catch (error) {
                // Axios가 잡은 오류 (4xx, 5xx, 네트워크 오류 등)
                console.error("Error fetching hint keys:", error);
                if (error.response) {
                    console.error("Hint keys fetch failed - HTTP Response:", error.response.status, error.response.data);
                    const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
                    alert(`힌트 키 목록 가져오기 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
                } else {
                    alert('네트워크 오류로 힌트 키 목록을 가져올 수 없습니다.');
                }
            }
        };
        fetchHintKeys();

    }, []); // 의존성 배열 비어있음

    // ✅ 아이디 중복 확인 핸들러 - axios 사용
    const checkUserIdDuplicate = async () => {
        // 아이디 입력 여부 클라이언트 유효성 검사
        if (!userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }

        try {
            // axios.get 사용 (URL에 아이디 포함)
            // TODO: 백엔드 중복 확인 엔드포인트 URL을 정확히 확인하세요. /checkId/{userId} 형태 예상
            const response = await axios.get(`${API_BASE_URL}${USER}/checkId/${userId}`);

            // Axios는 2xx 응답이 아니면 에러를 던집니다.
            if (response.data && response.data.statusCode === 200) {
                // 백엔드 응답 결과 (result 필드) 확인 (boolean 값 예상: false=사용 가능, true=중복)
                if (response.data.result === false) {
                    alert(`'${userId}'는 사용 가능한 아이디입니다.`);
                } else {
                    alert(`'${userId}'는 이미 사용 중인 아이디입니다.`);
                }
            } else {
                // 백엔드 2xx 응답이나 비즈니스 로직 오류
                console.error("중복 확인 실패 - 백엔드 오류:", response.data.statusCode, response.data.statusMessage);
                alert(`중복 확인 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
            }
        } catch (error) { // Axios가 잡은 오류는 err 대신 error 변수명을 주로 사용
            // Axios가 잡은 오류 (4xx, 5xx, 네트워크)
            console.error("중복 확인 요청 실패:", error);
            if (error.response) {
                console.error("Duplicate check failed - HTTP Response:", error.response.status, error.response.data);
                // 400 Bad Request 등 백엔드 유효성 검사 실패 시 오류 메시지
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
                alert(`중복 확인 중 오류가 발생했습니다: ${backendErrorMessage} (상태: ${error.response.status})`);
            } else {
                alert("중복 확인 요청 중 네트워크 오류가 발생했습니다.");
            }
        }
    };

    // 비밀번호 유효성 검사 핸들러
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        if (value.length < 8) {
            setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
        } else if (passwordCheck && value !== passwordCheck) { // 비밀번호 확인 입력이 있을 때만 체크
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError(''); // 유효성 통과
        }
    };

    // 비밀번호 확인 핸들러
    const handlePasswordCheckChange = (e) => {
        const value = e.target.value;
        setPasswordCheck(value);

        if (password.length >= 8 && password !== value) { // 비밀번호가 8자 이상이고 일치하지 않을 때
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else if (password.length < 8) { // 비밀번호 길이가 8자 미만이면 비밀번호 에러 메시지 유지
            setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
        }
        else {
            setPasswordError(''); // 유효성 통과
        }
    };


    // ✅ 회원가입 폼 제출 핸들러 - axios 사용
    const signup = async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // ✅ 클라이언트 측 유효성 검사
        if (!userId.trim()) { alert('아이디를 입력해주세요.'); return; }
        // TODO: 아이디 중복 확인을 했는지 여부 상태를 추가하고 여기서 확인하는 로직 필요
        if (!userName.trim()) { alert('이름을 입력해주세요.'); return; }
        if (password.length < 8) { alert('비밀번호는 최소 8자 이상이어야 합니다.'); return; }
        if (password !== passwordCheck) { alert('비밀번호가 일치하지 않습니다.'); return; }
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) { alert("전화번호 형식을 확인해주세요. 예: 010-1234-5678"); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { alert("이메일 형식을 확인해주세요."); return; }
        if (!hintKey) { alert("힌트 질문을 선택해주세요."); return; } // 힌트 키가 선택되지 않았는지 확인 ('0'도 유효한 코드일 수 있으므로 !hintKey 보다는 hintKey === '' 체크가 더 안전할 수 있습니다. 백엔드 명세 확인 필요)
        if (!hintValue.trim()) { alert("힌트 답변을 입력해주세요."); return; } // 힌트 답변이 비어있지 않은지 확인

        // 백엔드 UserInsertReqDto에 맞춰 데이터 객체 생성
        const registData = {
            userId: userId,
            password: password,
            userName: userName,
            email: email,
            phone: phone,
            hintKey: parseInt(hintKey), // 문자열로 받은 hintKey를 정수로 변환
            hintValue: hintValue,
        };
        console.log("회원가입 데이터:", registData); // 디버깅 로그

        try {
            // axios.post 사용 (registData는 JSON으로 자동 직렬화)
            // TODO: 백엔드 회원가입 엔드포인트 URL을 정확히 확인하세요. /insert 형태 예상
            const response = await axios.post(`${API_BASE_URL}${USER}/insert`, registData);

            // Axios는 2xx 응답이 아니면 에러를 던집니다.
            // 백엔드 CommonResDto의 statusCode를 확인합니다.
            if (response.data && response.data.statusCode === 201) { // 백엔드 성공 상태 코드 (201 Created 예상)
                alert(`${response.data.result}님 환영합니다! 회원가입이 완료되었습니다.`); // 응답 결과 메시지 표시 예상
                navigate('/login'); // 로그인 페이지로 이동
            } else {
                // 백엔드 2xx 응답이나 비즈니스 로직 오류 (statusCode != 201)
                console.error("Signup failed - Backend error:", response.data.statusCode, response.data.statusMessage);
                alert(`회원가입 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
            }

        } catch (error) {
            // Axios가 잡은 오류 (4xx, 5xx, 네트워크 오류 등)
            console.error("Error during signup:", error);
            if (error.response) {
                // 서버가 응답을 보낸 경우 (HTTP 상태 코드 확인)
                console.error("Signup failed - HTTP Response:", error.response.status, error.response.data);
                // 백엔드에서 보낸 오류 메시지 또는 기본 메시지 표시 (예: 400, 409 등)
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
                alert(`회원가입 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
            } else {
                // 응답 없음 또는 요청 설정 오류
                alert('회원가입 요청 중 네트워크 오류가 발생했습니다. 백엔드 서버 상태를 확인해주세요.');
            }
        }
    };

    return (
        <div className={styles['signup-page-wrapper']}>
            <div className={styles['signup-container']}>
                <h2>회원가입</h2>

                {/* 회원가입 폼 */}
                <form className={styles['signup-form']} onSubmit={signup}>

                    {/* 아이디 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="userId">아이디</label>
                        {/* 아이디 입력 필드와 중복확인 버튼 그룹 */}
                        <div className={styles['input-with-button']}>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                            />
                            <button
                                type="button" // 폼 제출을 막기 위해 button 타입을 'button'으로 명시
                                className={styles['check-duplication-button']}
                                onClick={checkUserIdDuplicate}
                            >
                                중복   
                                확인
                            </button>
                        </div>
                    </div>

                    {/* 이름 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="userName">이름</label>
                        <input
                            type="text"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    {/* 이메일 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* 비밀번호 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>

                    {/* 비밀번호 확인 필드 및 오류 메시지 */}
                    <div className={styles['form-group']}>
                        <input // 라벨 없음 (Placeholder 사용)
                            type="password"
                            placeholder="비밀번호 확인"
                            value={passwordCheck}
                            onChange={handlePasswordCheckChange}
                            required
                        />
                        {passwordError && <p className={styles['password-error']}>{passwordError}</p>} {/* SCSS 클래스 적용 */}
                    </div>

                    {/* 전화번호 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="phone">전화번호</label>
                        <input
                            type="tel" // 전화번호 타입
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {/* 힌트 질문 (Select 사용) */}
                    <div className={styles['form-group']}>
                        <label htmlFor="hintKey">힌트 질문</label>
                        <select
                            id="hintKey" // label의 htmlFor와 연결
                            value={hintKey} // 상태 변수 연결
                            // 선택된 value (code, string으로 받아짐)를 parseInt로 정수 변환하여 상태에 저장
                            // value가 ''일 경우 parseInt하면 NaN이 되므로, 빈 문자열 그대로 저장하거나 다른 기본값 설정 필요
                            onChange={(e) => setHintKey(e.target.value === '' ? '' : parseInt(e.target.value))}
                            required
                        >
                            <option value="">선택하세요</option> {/* 기본 옵션 */}
                            {/* 힌트 키 목록이 로딩되지 않았거나 비어있을 때 */}
                            {hintKeysList.length === 0 ? (
                                <option value="" disabled>질문 목록 로딩 중 또는 없음</option>
                            ) : (
                                // 힌트 키 목록을 순회하며 option 렌더링
                                hintKeysList.map((hint) => (
                                    // option의 value에 code (Integer) 사용, 사용자에게 보여줄 텍스트는 desc
                                    <option key={hint.code} value={hint.code}>
                                        {hint.desc}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* 힌트 답변 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="hintValue">힌트 답변</label>
                        <input
                            type="text"
                            id="hintValue"
                            value={hintValue}
                            onChange={(e) => setHintValue(e.target.value)}
                            required
                        />
                    </div>

                    {/* 제출 버튼 */}
                    <button type="submit" className={styles['submit-button']}>SIGN UP</button>

                </form>
            </div>
        </div>
    );
};

export default SignUpPage;