import React, { useContext, useEffect, useState } from 'react';
import styles from './Coupons.module.scss';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../content/UserContext';
import axiosInstance from 'axios';
import { API_BASE_URL, USER, COUPON } from '../../Axios/host-config';
import { handleAxiosError } from '../../Axios/HandleAxiosError';

const Coupons = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [couponList, setCouponList] = useState([]);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);
  const userKey = localStorage.getItem('USER_ID');

  const couponInsert = async (e) => {
    e.preventDefault();

    const couponData = {
      serialNumber,
      userKey,
    };

    try {
      await axiosInstance.post(
        `${API_BASE_URL}${USER}/couponInsert`,
        couponData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
          },
        },
      );
      alert('쿠폰이 등록되었습니다.');
      setSerialNumber('');
      findCoupon();
    } catch (e) {
      console.log(e);
      handleAxiosError(e, onLogin, navigate);
    }
  };

  const findCoupon = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${COUPON}/findByUserKey/${userKey}`,
      );
      console.log(res);
      setCouponList(res.data.result); // 바로 데이터를 설정
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    findCoupon(); // 페이지 로드 시 쿠폰 리스트를 불러옴
  }, []); // 빈 배열로 한 번만 실행

  return (
    <>
      <div className={styles.wrap}>
        <div className={styles.coupon_insert}>
          <div className='coupon_inner'>
            <h2>쿠폰등록</h2>
            <div className='coupon_input'>
              <p className='tit'>쿠폰 번호 등록</p>
              <div className='coupon_form'>
                <form onSubmit={couponInsert}>
                  <input
                    type='text'
                    name='serialNumber'
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                  <button type='submit' className='submit'>
                    등록하기
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.coupon_find_all}>
          <div className={styles.coupon_inner}>
            <h2>쿠폰 조회</h2>
            <div className={styles.coupon_list}>
              <ul>
                {couponList.map((coupon) => (
                  <li key={coupon.id}>
                    <h3>{coupon.couponTitle}</h3>
                    <p className={styles.serialNumber}>{coupon.serialNumber}</p>
                    <p className={styles.data}>
                      {coupon.expiredDate || '무기한'}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Coupons;
