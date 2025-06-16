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
      const all = res.data.result || [];
      console.log('응답된 쿠폰 목록:', all);
      setCouponList(all);
    } catch (err) {
      console.error('쿠폰 전체 조회 실패:', err);
    }
  };

  useEffect(() => {
    findAllCoupons();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toISOString().split('T')[0].replace(/-/g, '.');

  const getEndDate = (expireDate) => {
    return formatDate(expireDate);
  };

  const getCouponStatus = (coupon) => {
    return coupon.active === 'Y' || coupon.active === true ? '유효' : '만료';
  };

  const handleDelete = async (serialNumber) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(
          `${API_BASE_URL}${COUPON}/delete/${serialNumber}`,
        );
        alert('쿠폰이 삭제(비활성화)되었습니다.');
        findAllCoupons();
      } catch (err) {
        console.error('쿠폰 삭제 실패:', err);
      }
    }
  };

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
              <th>ID</th>
              <th>시리얼 번호</th>
              <th>쿠폰명</th>
              <th>기간</th>
              <th>수량</th>
              <th>등록일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {couponList.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyMessage}>
                  조회된 쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              couponList.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.id}</td>
                  <td>{coupon.serialNumber}</td>
                  <td>{coupon.couponTitle}</td>
                  <td>
                    {`${formatDate(coupon.registDate)} - ${getEndDate(coupon.expireDate)}`}
                  </td>
                  <td>{coupon.count}</td>
                  <td>{formatDate(coupon.registDate)}</td>
                  <td className={styles.colStatus}>
                    {getCouponStatus(coupon)}
                  </td>
                  <td>
                    {getCouponStatus(coupon) === '유효' && (
                      <button onClick={() => handleDelete(coupon.serialNumber)}>
                        삭제
                      </button>
                    )}
                  </td>
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
