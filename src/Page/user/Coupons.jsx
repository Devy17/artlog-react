import React, { useContext, useEffect, useState } from 'react';
import styles from './Coupons.module.scss';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, USER, COUPON } from '../../Axios/host-config';
import { handleAxiosError } from '../../Axios/HandleAxiosError';
import axiosInstance from '../../Axios/AxiosBackConfig';

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
        // {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
        //   },
        // },
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
      {/* ✅ styles.wrap 적용 */}
      <div className={styles.wrap}>
        {/* ✅ styles.coupon_insert 적용 */}
        <div className={styles.coupon_insert}>
          {/* ✅ styles.coupon_inner 적용 */}
          <div className={styles.coupon_inner}>
            <h2>쿠폰등록</h2>
            {/* ✅ styles.coupon_input 적용 */}
            <div className={styles.coupon_input}>
              {/* ✅ styles.tit 적용 */}
              <p className={styles.tit}>쿠폰 번호 등록</p>
              {/* ✅ styles.coupon_form 적용 */}
              <div className={styles.coupon_form}>
                <form onSubmit={couponInsert}>
                  <input
                    type='text'
                    name='serialNumber'
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                  {/* ✅ styles.submit 적용 */}
                  <button type='submit' className={styles.submit}>
                    등록하기
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ styles.coupon_find_all 적용 */}
        <div className={styles.coupon_find_all}>
          {/* ✅ styles.coupon_inner 적용 */}
          <div className={styles.coupon_inner}>
            <h2>쿠폰 조회</h2>
            {/* ✅ styles.coupon_list 적용 */}
            <div className={styles.coupon_list}>
              {/* 목록 없음 메시지 */}
              {couponList.length === 0 ? (
                <p className={styles['no-coupon-message']}>
                  등록된 쿠폰이 없습니다.
                </p>
              ) : (
                <ul>
                  {couponList.map((coupon, index) => (
                    <li key={index}>
                      <h3>{coupon.couponTitle}</h3>
                      <p className={styles.serialNumber}>
                        {coupon.serialNumber}
                      </p>
                      <p className={styles.data}>
                        {coupon.expiredDate
                          ? new Date(coupon.expiredDate).toLocaleDateString()
                          : '무기한'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Coupons;
