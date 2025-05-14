import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/UserContext";
import { API_BASE_URL, USER } from '../../Axios/host-config';
import './SignUpPage.css'; // CSS 파일 임포트

// import axios from "axios";




const SignUpPage = () => {
    // 백엔드 UserInsertReqDto 구조에 맞춰 상태 정의
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hintKey, setHintKey] = useState('');
    const [hintValue, setHintValue] = useState('');

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


    useEffect(() => {
        const fetchHintKeys = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}${USER}/hintKeys`);

                const data = await res.json();

               console.log("Hint keys response:", data); // 응답 데이터 로깅
                if (res.status === 200 && data.statusCode === 200) {
                    
                    setHintKeysList(data.result);
                } else {

                    console.error("Failed to fetch hint keys:", data.statusMessage);
                    alert(`힌트 키 목록을 가져오는데 실패했습니다: ${data.statusMessage || '알 수 없는 오류'}`);
                }
            } catch (error) {
                // 네트워크 오류 등 fetch 요청 자체에서 발생한 예외 처리
                console.error("Error fetching hint keys:", error);
                alert('네트워크 오류로 힌트 키 목록을 가져올 수 없습니다.');
            }
        };
        fetchHintKeys();

    }, []); 
    

    // 회원가입 폼 제출 핸들러
    const signup = async (e) => {
        e.preventDefault();

        const registData = {
            userId: userId,
            password: password,
            userName: userName,
            email: email,
            phone: phone,
            hintKey: parseInt(hintKey), 
            hintValue: hintValue,
        };

    

        try {
            const res = await fetch(`${API_BASE_URL}${USER}/insert`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json', 
                },
                body: JSON.stringify(registData), 
            });

            const data = await res.json();



          
   
            if (res.status === 200 && data.statusCode === 201 ) {

                alert(`${data.result}님 환영합니다! 회원가입이 완료되었습니다.`);
                navigate('/login'); 
            } else if (res.status === 400 && data.statusCode === 400) {
                 // 백엔드에서 400 오류 (예: 중복 아이디/이메일/전화번호) 발생 시
                 alert(`회원가입 실패: ${data.statusMessage}`); // 백엔드가 보낸 오류 메시지 표시
                 
                 console.error("Signup failed (400):", data);
            }
             else {
                alert(`회원가입 중 오류가 발생했습니다: ${data.statusMessage || '알 수 없는 오류'}`);
                console.error("Signup failed:", data); // 디버깅을 위해 전체 응답 로깅
            }

        } catch (error) {
            // 네트워크 오류, CORS 오류 등 fetch 요청 자체에서 발생한 예외 처리
            alert('회원가입 요청 중 네트워크 오류가 발생했습니다. 백엔드 서버 상태를 확인해주세요.');
            console.error("Error during signup fetch:", error);
        }
    };

    return (
    <div className="signup-page-wrapper">
        <div className="signup-container">
            <h2>회원가입</h2> 

            {/* 회원가입 폼 */}
            <form className="signup-form" onSubmit={signup}>


                <div className="form-group">
                    <label htmlFor="userId">User Id</label> {/* 사진1 라벨 반영 */}

                    <div className="input-with-button">
                        <input
                            type="text"
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required

                        />
  
                        <button
                            type="button" // 폼 제출을 막기 위해 button 타입을 'button'으로 명시
                            className="check-duplication-button" // CSS 클래스

                        >
                            중복확인
                        </button>
                    </div>
                </div>

                 {/* 이름 필드 */}
                <div className="form-group">
                    <label htmlFor="userName">Name</label>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                </div>

                {/* 이메일 필드 */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>


                {/* 비밀번호 필드 */}
                <div className="form-group">
                    <label htmlFor="password">Pw</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                 {/* 전화번호 필드 */}
                 <div className="form-group">
                    <label htmlFor="phone">Phone Num</label> {/* 사진1 라벨 반영 */}
                    <input
                        type="tel" // 전화번호 타입
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>


                {/* 비밀번호 힌트 질문 (Select 사용) */}
                {/* 사진1에는 InputField로 보이지만, 기능상 Select가 적합하며 hintKeysList를 사용하므로 Select 유지 */}
                <div className="form-group">
                    <label htmlFor="hintKey">Hint</label> {/* 사진1 라벨 반영 */}
                    <select
                        id="hintKey" // label의 htmlFor와 연결
                        value={hintKey} // 상태 변수 연결 (Integer 값)
                        // 선택된 value (code, string으로 받아짐)를 parseInt로 정수 변환하여 상태에 저장
                        onChange={(e) => setHintKey(parseInt(e.target.value) || '')}
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


                {/* 비밀번호 힌트 답변 필드 */}
                <div className="form-group">
                    <label htmlFor="hintValue">Answer</label> 
                    <input
                        type="text"
                        id="hintValue"
                        value={hintValue}
                        onChange={(e) => setHintValue(e.target.value)}
                        required
                    />
                </div>


         
            
                <button type="submit" className="submit-button">SIGN UP</button> 

            </form>
        </div>
        </div>
    );
};



export default SignUpPage;