import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import styles from './AdminCouponRegisterPage.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';

// KST 기준 ISO 문자열 생성 함수
const toKSTISOString = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  const kst = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return `${kst.getFullYear()}-${pad(kst.getMonth() + 1)}-${pad(kst.getDate())}T${pad(kst.getHours())}:${pad(kst.getMinutes())}:${pad(kst.getSeconds())}`;
};

const AdminCouponRegisterPage = () => {
  const today = new Date();
  const [form, setForm] = useState({
    couponTitle: '',
    serialNumber: '',
    count: '',
    expireDate: null,
  });
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setStartDate(today);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEndDateChange = (date) => {
    if (date) {
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      setEndDate(endOfDay);
      setForm({ ...form, expireDate: endOfDay });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !form.couponTitle ||
      !form.serialNumber ||
      !form.count ||
      !form.expireDate
    ) {
      setErrorMessage('모든 항목을 입력해 주세요.');
      return;
    }

    if (parseInt(form.count) <= 0) {
      setErrorMessage('쿠폰 수량은 1개 이상이어야 합니다.');
      return;
    }

    if (form.expireDate < new Date()) {
      setErrorMessage('쿠폰 종료일은 오늘 이후여야 합니다.');
      return;
    }

    const period =
      endDate && startDate
        ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        : null;

    const payload = {
      ...form,
      period: period,
      expireDate: toKSTISOString(form.expireDate),
    };

    try {
      await axiosInstance.post(`${API_BASE_URL}${COUPON}/insert`, payload);
      alert('쿠폰이 정상 등록되었습니다.');
      setForm({
        couponTitle: '',
        serialNumber: '',
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

        <div className={styles.formGroup}>
          <label htmlFor='couponTitle'>쿠폰명</label>
          <input
            type='text'
            id='couponTitle'
            name='couponTitle'
            value={form.couponTitle}
            onChange={handleChange}
          />
          <p className={styles.guide}>
            ** 쿠폰 이름 규칙 **
            <br />
            액수 할인의 경우: [금액]원 [이름] Ex) 1000원 가입할인쿠폰
            <br />
            퍼센트 할인의 경우: [할인율]% [이름] Ex) 10% 파격세일쿠폰
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='serialNumber'>시리얼 번호</label>
          <input
            type='text'
            id='serialNumber'
            name='serialNumber'
            value={form.serialNumber}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='expireDate'>종료일 지정</label>
          <DatePicker
            className={styles['custom-date-range']}
            calendarClassName={styles.calendar}
            placeholderText='종료일 선택'
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={new Date(new Date().setHours(0, 0, 0, 0))}
            dateFormat='yyyy.MM.dd'
            shouldCloseOnSelect={true} // ✅ 선택 시 자동 닫힘
            value={
              endDate
                ? `${startDate.toISOString().slice(0, 10).replace(/-/g, '.')} - ${endDate
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, '.')}`
                : ''
            }
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='count'>수량</label>
          <input
            type='number'
            id='count'
            name='count'
            value={form.count}
            onChange={handleChange}
          />
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button type='submit'>쿠폰 등록</button>
      </form>
    </div>
  );
};

export default AdminCouponRegisterPage;
