import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext'; // Correct path if different
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignUpPage.module.scss'; // SCSS 모듈 임포트
import axios from "axios"; // axios 임포트

const SignUpPage = () => {
    // ... (existing states for userId, userName, email, phone, hintKey, hintValue)
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hintKey, setHintKey] = useState('');
    const [hintValue, setHintValue] = useState('');

    // ... (existing states for password, passwordCheck, passwordError)
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // ✅ 아이디 중복 확인 상태 추가
    const [isUserIdAvailable, setIsUserIdAvailable] = useState(false); // 현재 아이디가 사용 가능한지 여부
    const [isUserIdChecked, setIsUserIdChecked] = useState(false);   // 현재 아이디에 대해 중복 확인을 완료했는지 여부

    // ... (existing state for hintKeysList)
    const [hintKeysList, setHintKeysList] = useState([]);

    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext); // Assuming correct path for AuthContext

    // ... (useEffect for isLoggedIn check - same as before)
    useEffect(() => {
        if (isLoggedIn) {
            alert('이미 로그인된 상태입니다.');
            navigate('/', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    // ... (useEffect for fetchHintKeys - same as before, using axios)
    useEffect(() => {
        const fetchHintKeys = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}${USER}/hintKeys`);
                if (response.data && response.data.statusCode === 200) {
                    const hints = response.data.result;
                    setHintKeysList(Array.isArray(hints) ? hints : []);
                } else {
                    console.error("힌트 키 가져오기 실패 - 백엔드 오류:", response.data.statusCode, response.data.statusMessage);
                    alert(`힌트 키 목록을 가져오는데 실패했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
                }
            } catch (error) {
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
    }, []);

    // ✅ 아이디 입력 필드 변경 핸들러 (중복 확인 상태 초기화 포함)
    const handleUserIdChange = (e) => {
        setUserId(e.target.value);
        // ✅ 아이디 값이 변경되면 중복 확인 상태를 초기화합니다.
        setIsUserIdChecked(false);
        setIsUserIdAvailable(false);
    };

    // ✅ 아이디 중복 확인 핸들러 (axios 사용 및 상태 업데이트)
    const checkUserIdDuplicate = async () => {
        if (!userId.trim()) {
            alert("아이디를 입력해주세요.");
            // ✅ 입력값이 없으면 상태 초기화
            setIsUserIdChecked(false);
            setIsUserIdAvailable(false);
            return;
        }

        // ✅ 중복 확인 시작 시 상태 초기화
        setIsUserIdChecked(false);
        setIsUserIdAvailable(false);

        try {
            const response = await axios.get(`${API_BASE_URL}${USER}/checkId/${userId}`);

            if (response.data && response.data.statusCode === 200) {
                // ✅ 중복 확인 성공 시 상태 업데이트
                setIsUserIdChecked(true);
                if (response.data.result === false) { // Assuming false = available
                    setIsUserIdAvailable(true);
                    alert(`'${userId}'는 사용 가능한 아이디입니다.`);
                } else { // Assuming true = unavailable/duplicate
                    setIsUserIdAvailable(false);
                    alert(`'${userId}'는 이미 사용 중인 아이디입니다.`);
                }
            } else {
                // ✅ 백엔드 2xx 응답이나 비즈니스 로직 오류 시 상태 초기화 (오류로 간주)
                setIsUserIdChecked(false); // 체크 실패
                setIsUserIdAvailable(false); // 사용 불가능으로 간주
                console.error("중복 확인 실패 - 백엔드 오류:", response.data.statusCode, response.data.statusMessage);
                alert(`중복 확인 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
            }
        } catch (error) {
            // ✅ Axios 오류 발생 시 상태 초기화 (오류로 간주)
            setIsUserIdChecked(false); // 체크 실패
            setIsUserIdAvailable(false); // 사용 불가능으로 간주

            console.error("중복 확인 요청 실패:", error);
            if (error.response) {
                console.error("Duplicate check failed - HTTP Response:", error.response.status, error.response.data);
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
                alert(`중복 확인 중 오류가 발생했습니다: ${backendErrorMessage} (상태: ${error.response.status})`);
            } else {
                alert("중복 확인 요청 중 네트워크 오류가 발생했습니다.");
            }
        }
    };

    // ... (handlePasswordChange, handlePasswordCheckChange - same as before)
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length < 8) {
            setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
        } else if (passwordCheck && value !== passwordCheck) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordError('');
        }
    };

    const handlePasswordCheckChange = (e) => {
        const value = e.target.value;
        setPasswordCheck(value);
        if (password.length >= 8 && password !== value) {
            setPasswordError('비밀번호가 일치하지 않습니다.');
        } else if (password.length < 8) {
            setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
        }
        else {
            setPasswordError('');
        }
    };


    // ✅ 회원가입 폼 제출 핸들러 - 중복 확인 상태 체크 추가
    const signup = async (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // ✅ 아이디 중복 확인 상태 체크 추가
        if (!isUserIdChecked) {
            alert("아이디 중복 확인을 먼저 해주세요.");
            return;
        }
        if (!isUserIdAvailable) {
            alert("사용할 수 없는 아이디입니다. 다른 아이디를 선택하거나 중복 확인을 다시 해주세요.");
            return;
        }

        // ✅ 기존 클라이언트 측 유효성 검사
        if (!userId.trim()) { alert('아이디를 입력해주세요.'); return; }
        if (!userName.trim()) { alert('이름을 입력해주세요.'); return; }
        if (password.length < 8) { alert('비밀번호는 최소 8자 이상이어야 합니다.'); return; }
        if (password !== passwordCheck) { alert('비밀번호가 일치하지 않습니다.'); return; }
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) { alert("전화번호 형식을 확인해주세요. 예: 010-1234-5678"); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { alert("이메일 형식을 확인해주세요."); return; }
        if (!hintKey) { alert("힌트 질문을 선택해주세요."); return; }
        if (!hintValue.trim()) { alert("힌트 답변을 입력해주세요."); return; }

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
            const response = await axios.post(`${API_BASE_URL}${USER}/insert`, registData);

            if (response.data && response.data.statusCode === 201) {
                alert(`${response.data.result}님 환영합니다! 회원가입이 완료되었습니다.`);
                navigate('/login'); // 로그인 페이지로 이동
            } else {
                console.error("Signup failed - Backend error:", response.data.statusCode, response.data.statusMessage);
                alert(`회원가입 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`);
            }

        } catch (error) {
            console.error("Error during signup:", error);
            if (error.response) {
                console.error("Signup failed - HTTP Response:", error.response.status, error.response.data);
                const backendErrorMessage = error.response.data && error.response.data.statusMessage ? error.response.data.statusMessage : '서버 오류';
                alert(`회원가입 실패: ${backendErrorMessage} (상태: ${error.response.status})`);
            } else {
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
                                onChange={handleUserIdChange} // ✅ 변경된 핸들러 사용
                                required
                            />
                            <button
                                type="button" // 폼 제출 방지
                                className={styles['check-duplication-button']}
                                onClick={checkUserIdDuplicate} // ✅ 중복 확인 핸들러 사용
                            >
                                중복 확인 
                            </button>
                        </div>

                         {isUserIdChecked && (
                            isUserIdAvailable ?
                            <p style={{ color: 'green', fontSize: '0.85em', marginTop: '5px' }}>사용 가능한 아이디입니다.</p> :
                            <p style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>이미 사용 중인 아이디입니다.</p>
                         )}
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
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={passwordCheck}
                            onChange={handlePasswordCheckChange}
                            required
                        />
                        {passwordError && <p className={styles['password-error']}>{passwordError}</p>}
                    </div>

                    {/* 전화번호 필드 */}
                    <div className={styles['form-group']}>
                        <label htmlFor="phone">전화번호</label>
                        <input
                            type="tel"
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
                            id="hintKey"
                            value={hintKey}
                            onChange={(e) => setHintKey(e.target.value)} // ✅ parseInt 제거 (select value는 항상 문자열)
                            required
                        >
                            <option value="">선택하세요</option>
                            {hintKeysList.length === 0 ? (
                                <option value="" disabled>질문 목록 로딩 중 또는 없음</option>
                            ) : (
                                hintKeysList.map((hint) => (
                                    <option key={hint.code} value={hint.code}> {/* value는 code (숫자) */}
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