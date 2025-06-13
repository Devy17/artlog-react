import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';
import styles from './AdminCouponListPage.module.scss';
import { useNavigate } from 'react-router-dom';

const AdminCouponListPage = () => {
  const [couponList, setCouponList] = useState([]);
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/admin/coupon-register');
  };

  const findAllCoupons = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}${COUPON}/findByAll`);
      setCouponList(res.data.data || []);
    } catch (err) {
      console.error('쿠폰 전체 조회 실패:', err);
    }
  };

  useEffect(() => {
    findAllCoupons();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <div className={styles.headerRow}>
          <h1>전체 쿠폰 조회</h1>
          <button onClick={handleRegisterClick} className={styles.registerBtn}>
            + Add New Coupon
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colId}>ID</th>
              <th className={styles.colSerial}>시리얼 번호</th>
              <th className={styles.colTitle}>쿠폰명</th>
              <th className={styles.colPeriod}>기간</th>
              <th className={styles.colCount}>수량</th>
              <th className={styles.colRegist}>등록일</th>
              <th className={styles.colUpdate}>수정일</th>
            </tr>
          </thead>
          <tbody>
            {couponList.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyMessage}>
                  조회된 쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              couponList.map((coupon) => (
                <tr key={coupon.id}>
                  <td className={styles.colId}>{coupon.id}</td>
                  <td className={styles.colSerial}>{coupon.serialNumber}</td>
                  <td className={styles.colTitle}>{coupon.couponTitle}</td>
                  <td className={styles.colPeriod}>{coupon.period}</td>
                  <td className={styles.colCount}>{coupon.count}</td>
                  <td className={styles.colRegist}>{coupon.registDate}</td>
                  <td className={styles.colUpdate}>{coupon.updateDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCouponListPage;
