import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';
import styles from './AdminCouponListPage.module.scss';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// KST 기준 ISO 문자열 생성 함수
const toKSTISOString = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  const kst = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return `${kst.getFullYear()}-${pad(kst.getMonth() + 1)}-${pad(kst.getDate())}T${pad(kst.getHours())}:${pad(kst.getMinutes())}:${pad(kst.getSeconds())}`;
};

const AdminCouponListPage = () => {
  const [couponList, setCouponList] = useState([]);
  const [editCouponId, setEditCouponId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/admin/coupon-register');
  };

  const findAllCoupons = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}${COUPON}/findByAll`);
      const all = res.data.result || [];
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

  const getEndDate = (expireDate) => formatDate(expireDate);

  const getCouponStatus = (coupon) =>
    coupon.active === 'Y' || coupon.active === true ? '유효' : '만료';

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

  const startEdit = (coupon) => {
    setEditCouponId(coupon.id);
    setEditedData({
      count: coupon.count,
      expireDate: new Date(coupon.expireDate),
    });
  };

  const cancelEdit = () => {
    setEditCouponId(null);
    setEditedData({});
  };

  const saveEdit = async (id) => {
    try {
      await axiosInstance.post(`${API_BASE_URL}${COUPON}/update`, {
        id,
        count: editedData.count,
        expireDate: toKSTISOString(editedData.expireDate),
      });
      alert('수정 완료');
      setEditCouponId(null);
      setEditedData({});
      findAllCoupons();
    } catch (err) {
      console.error('쿠폰 수정 실패:', err);
      alert('수정 실패');
    }
  };

  const handleKeyDown = (e, couponId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(couponId);
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
                    {editCouponId === coupon.id ? (
                      <DatePicker
                        className={styles['custom-date-range']}
                        selected={editedData.expireDate}
                        onChange={(date) => {
                          const endOfDay = new Date(date);
                          endOfDay.setHours(23, 59, 59, 999);
                          setEditedData((prev) => ({
                            ...prev,
                            expireDate: endOfDay,
                          }));
                        }}
                        minDate={new Date()}
                        dateFormat='yyyy.MM.dd'
                        value={`${formatDate(coupon.registDate)} - ${
                          editedData.expireDate
                            ? formatDate(editedData.expireDate)
                            : ''
                        }`}
                        onKeyDown={(e) => handleKeyDown(e, coupon.id)}
                      />
                    ) : (
                      `${formatDate(coupon.registDate)} - ${getEndDate(coupon.expireDate)}`
                    )}
                  </td>
                  <td>
                    {editCouponId === coupon.id ? (
                      <input
                        type='number'
                        value={editedData.count}
                        onChange={(e) => {
                          const inputVal = e.target.value;
                          setEditedData((prev) => ({
                            ...prev,
                            count: inputVal === '' ? '' : Number(inputVal),
                          }));
                        }}
                        onBlur={() => {
                          if (editedData.count === '') {
                            setEditedData((prev) => ({
                              ...prev,
                              count: 0,
                            }));
                          }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, coupon.id)}
                      />
                    ) : (
                      coupon.count
                    )}
                  </td>
                  <td>{formatDate(coupon.registDate)}</td>
                  <td
                    className={`${styles.colStatus} ${
                      coupon.active === 'Y' || coupon.active === true
                        ? styles.valid
                        : styles.expired
                    }`}
                  >
                    {getCouponStatus(coupon)}
                  </td>

                  <td className={styles.colActions}>
                    {editCouponId === coupon.id ? (
                      <>
                        <button onClick={() => saveEdit(coupon.id)}>
                          저장
                        </button>
                        <button onClick={cancelEdit}>취소</button>
                      </>
                    ) : getCouponStatus(coupon) === '유효' ? (
                      <div className={styles.buttonGroup}>
                        <button
                          onClick={() => handleDelete(coupon.serialNumber)}
                        >
                          삭제
                        </button>
                        <button onClick={() => startEdit(coupon)}>수정</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(coupon)}>활성화</button>
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
