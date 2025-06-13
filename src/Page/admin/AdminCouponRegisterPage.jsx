import React, { useState, useEffect } from 'react'; // useEffect 추가
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import styles from './AdminCouponRegisterPage.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';

const AdminCouponRegisterPage = () => {
  const today = new Date();
  const [form, setForm] = useState({
    couponTitle: '',
    serialNumber: '',
    period: '',
    count: '',
    expireDate: null,
  });
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 시작일은 항상 오늘로 고정
    setStartDate(today);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (date) {
      const diff = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
      setForm({ ...form, expireDate: date, period: diff });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const payload = {
      ...form,
      expireDate: form.expireDate?.toISOString(),
    };
    try {
      await axiosInstance.post(`${API_BASE_URL}${COUPON}/insert`, payload);
      alert('쿠폰이 정상 등록되었습니다.');
      setForm({
        couponTitle: '',
        serialNumber: '',
        period: '',
        count: '',
        expireDate: null,
      });
      setStartDate(today);
      setEndDate(null);
    } catch (err) {
      console.error('등록 실패:', err);
      setErrorMessage(
        err.response?.data?.message ||
          '등록 중 알 수 없는 오류가 발생했습니다.',
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>쿠폰 등록</h1>

        <label>
          쿠폰명
          <input
            type='text'
            name='couponTitle'
            value={form.couponTitle}
            onChange={handleChange}
          />
          <p className={styles.guide}>
            ** 쿠폰 이름 규칙 **
            <br />
            액수 할인일 때: &lt;금액&gt;원&lt;쿠폰 정보&gt; 예)
            3000원회원가입할인쿠폰, 5000원 감사 쿠폰
            <br />
            퍼센트 할인일 때: &lt;할인율&gt;%&lt;쿠폰 정보&gt; 예) 10%파격세일,
            30% 감사 쿠폰
          </p>
        </label>

        <label>
          시리얼 번호
          <input
            type='text'
            name='serialNumber'
            value={form.serialNumber}
            onChange={handleChange}
          />
        </label>

        <label>
          종료일 지정
          <DatePicker
            className={styles['custom-date-range']}
            calendarClassName={styles.calendar}
            placeholderText='종료일 선택'
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={today}
            dateFormat='yyyy.MM.dd'
            formatWeekDay={(dayName) => dayName.substr(0, 3)}
            value={
              endDate
                ? `${startDate.toISOString().slice(0, 10).replace(/-/g, '.')} - ${endDate
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '.')}`
                : ''
            }
          />
        </label>

        <label>
          수량
          <input
            type='number'
            name='count'
            value={form.count}
            onChange={handleChange}
          />
        </label>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button type='submit'>쿠폰 등록</button>
      </form>
    </div>
  );
};

export default AdminCouponRegisterPage;
