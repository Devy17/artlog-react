import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, USER } from '../../Axios/host-config';
import styles from './SignUpPage.module.scss';
import axios from 'axios';
import ModalContext from '../../Modal/ModalContext';

const SignUpPage = () => {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hintKey, setHintKey] = useState('');
  const [hintValue, setHintValue] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(false);
  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [hintKeysList, setHintKeysList] = useState([]);

  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchHintKeys = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${USER}/hintKeys`);
        if (response.data && response.data.statusCode === 200) {
          const hints = response.data.result;
          setHintKeysList(Array.isArray(hints) ? hints : []);
        } else {
          alert(
            `힌트 키 목록을 가져오는데 실패했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`,
          );
        }
      } catch (error) {
        alert('네트워크 오류로 힌트 키 목록을 가져올 수 없습니다.');
      }
    };
    fetchHintKeys();
  }, []);

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    setIsUserIdChecked(false);
    setIsUserIdAvailable(false);
  };

  const checkUserIdDuplicate = async () => {
    if (!userId.trim()) {
      alert('아이디를 입력해주세요.');
      setIsUserIdChecked(false);
      setIsUserIdAvailable(false);
      return;
    }
    setIsUserIdChecked(false);
    setIsUserIdAvailable(false);
    try {
      const response = await axios.get(
        `${API_BASE_URL}${USER}/checkId/${userId}`,
      );
      if (response.data && response.data.statusCode === 200) {
        setIsUserIdChecked(true);
        if (response.data.result === false) {
          setIsUserIdAvailable(true);
          alert(`'${userId}'는 사용 가능한 아이디입니다.`);
        } else {
          setIsUserIdAvailable(false);
          alert(`'${userId}'는 이미 사용 중인 아이디입니다.`);
        }
      } else {
        alert(
          `중복 확인 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`,
        );
      }
    } catch (error) {
      alert('중복 확인 요청 중 네트워크 오류가 발생했습니다.');
    }
  };

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
    } else {
      setPasswordError('');
    }
  };

  const signup = async (e) => {
    e.preventDefault();

    if (!isUserIdChecked) {
      alert('아이디 중복 확인을 먼저 해주세요.');
      return;
    }
    if (!isUserIdAvailable) {
      alert(
        '사용할 수 없는 아이디입니다. 다른 아이디를 선택하거나 중복 확인을 다시 해주세요.',
      );
      return;
    }
    if (!userId.trim()) {
      alert('아이디를 입력해주세요.');
      return;
    }
    if (!userName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordCheck) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      alert('전화번호 형식을 확인해주세요. 예: 010-1234-5678');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('이메일 형식을 확인해주세요.');
      return;
    }
    if (!hintKey) {
      alert('힌트 질문을 선택해주세요.');
      return;
    }
    if (!hintValue.trim()) {
      alert('힌트 답변을 입력해주세요.');
      return;
    }

    const registData = {
      userId,
      password,
      userName,
      email,
      phone,
      hintKey: parseInt(hintKey),
      hintValue,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}${USER}/insert`,
        registData,
      );
      if (response.data && response.data.statusCode === 201) {
        alert(
          `${response.data.result}님 환영합니다! 회원가입이 완료되었습니다.`,
        );
        navigate('/', { replace: true, state: { showLoginModal: true } });
      } else {
        alert(
          `회원가입 중 오류가 발생했습니다: ${response.data.statusMessage || '알 수 없는 오류'}`,
        );
      }
    } catch (error) {
      alert('회원가입 요청 중 네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles['signup-page-wrapper']}>
      <div className={styles['signup-container']}>
        <h2>회원가입</h2>
        <form className={styles['signup-form']} onSubmit={signup}>
          {/* 아이디 필드 */}
          <div className={styles['form-group']}>
            <label htmlFor='userId'>아이디</label>
            <div className={styles['input-with-button']}>
              <input
                type='text'
                id='userId'
                value={userId}
                onChange={handleUserIdChange}
                required
              />
              <button
                type='button'
                className={styles['check-duplication-button']}
                onClick={checkUserIdDuplicate}
              >
                중복 확인
              </button>
            </div>
            {isUserIdChecked && (
              <p
                style={{
                  color: isUserIdAvailable ? 'green' : 'red',
                  fontSize: '0.85em',
                  marginTop: '5px',
                }}
              >
                {isUserIdAvailable
                  ? '사용 가능한 아이디입니다.'
                  : '이미 사용 중인 아이디입니다.'}
              </p>
            )}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='userName'>이름</label>
            <input
              type='text'
              id='userName'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='email'>이메일</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='password'>비밀번호</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <input
              type='password'
              placeholder='비밀번호 확인'
              value={passwordCheck}
              onChange={handlePasswordCheckChange}
              required
            />
            {passwordError && (
              <p className={styles['password-error']}>{passwordError}</p>
            )}
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='phone'>전화번호</label>
            <input
              type='tel'
              id='phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='hintKey'>힌트 질문</label>
            <select
              id='hintKey'
              value={hintKey}
              onChange={(e) => setHintKey(e.target.value)}
              required
            >
              <option value=''>선택하세요</option>
              {hintKeysList.length === 0 ? (
                <option value='' disabled>
                  질문 목록 로딩 중 또는 없음
                </option>
              ) : (
                hintKeysList.map((hint) => (
                  <option key={hint.code} value={hint.code}>
                    {hint.desc}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor='hintValue'>힌트 답변</label>
            <input
              type='text'
              id='hintValue'
              value={hintValue}
              onChange={(e) => setHintValue(e.target.value)}
              required
            />
          </div>

          <button type='submit' className={styles['submit-button']}>
            SIGN UP
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
