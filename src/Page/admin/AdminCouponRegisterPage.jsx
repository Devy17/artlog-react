import React, { useState } from 'react';
import styles from './AdminCouponRegisterPage.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminCouponRegisterPage = () => {
  const [form, setForm] = useState({
    couponTitle: '',
    serialNumber: '',
    period: '',
    count: '',
    expireDate: null,
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      setForm({
        ...form,
        expireDate: end,
        period: diff,
      });
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
      setStartDate(null);
      setEndDate(null);
    } catch (err) {
      console.error('등록 실패:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('등록 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <h1>쿠폰 등록 페이지</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              퍼센트 할인일 때: &lt;할인율&gt;%&lt;쿠폰 정보&gt; 예)
              10%파격세일, 30% 감사 쿠폰
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
            유효기간 선택
            <DatePicker
              className={styles['custom-date-range']}
              placeholderText='시작일 ~ 종료일 선택'
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              dateFormat='yyyy-MM-dd'
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
    </div>
  );
};

export default AdminCouponRegisterPage;
