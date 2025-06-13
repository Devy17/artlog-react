import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';
import styles from './AdminCouponListPage.module.scss';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminCouponListPage = () => {
  const [couponList, setCouponList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [newCount, setNewCount] = useState(0);

  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/admin/coupon-register');
  };

  const findAllCoupons = async () => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}${COUPON}/findByAll`);
      setCouponList(res.data.result || []);
    } catch (err) {
      console.error('쿠폰 전체 조회 실패:', err);
    }
  };

  useEffect(() => {
    findAllCoupons();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toISOString().split('T')[0].replace(/-/g, '.');

  const getEndDate = (registDate, period) => {
    const end = new Date(registDate);
    end.setDate(end.getDate() + period);
    return formatDate(end.toISOString());
  };

  const checkIfExpired = (registDate, period) => {
    const start = new Date(registDate);
    const expireDate = new Date(start);
    expireDate.setDate(start.getDate() + period);
    const today = new Date();
    return today > expireDate ? '만료' : '유효';
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon.id);
    const start = new Date(coupon.registDate);
    const end = new Date(start);
    end.setDate(start.getDate() + coupon.period);
    setDateRange([start, end]);
    setNewCount(coupon.count);
  };

  const handleSave = async (couponId) => {
    if (startDate && endDate && newCount > 0) {
      const period = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const payload = {
        id: couponId,
        period,
        count: newCount,
      };
      try {
        await axiosInstance.put(
          `${API_BASE_URL}${COUPON}/update-period`,
          payload,
        );
        alert('쿠폰이 수정되었습니다.');
        setEditingId(null);
        findAllCoupons();
      } catch (err) {
        console.error('쿠폰 수정 실패:', err);
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
              <th>수정일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {couponList.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyMessage}>
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
                    {editingId === coupon.id ? (
                      <DatePicker
                        selected={startDate}
                        onChange={(update) => setDateRange(update)}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        minDate={new Date()}
                        dateFormat='yyyy.MM.dd'
                        placeholderText='시작일 ~ 종료일'
                      />
                    ) : (
                      `${formatDate(coupon.registDate)} - ${getEndDate(coupon.registDate, coupon.period)}`
                    )}
                  </td>
                  <td>
                    {editingId === coupon.id ? (
                      <input
                        type='number'
                        min='1'
                        defaultValue={coupon.count}
                        onChange={(e) => setNewCount(Number(e.target.value))}
                        className={styles.countInput}
                      />
                    ) : (
                      coupon.count
                    )}
                  </td>
                  <td>{formatDate(coupon.registDate)}</td>
                  <td>{formatDate(coupon.updateDate)}</td>
                  <td className={styles.colStatus}>
                    {coupon.count <= 0 ||
                    checkIfExpired(coupon.registDate, coupon.period) === '만료'
                      ? '만료'
                      : '유효'}
                  </td>
                  <td>
                    {editingId === coupon.id ? (
                      <button onClick={() => handleSave(coupon.id)}>
                        저장
                      </button>
                    ) : (
                      <button onClick={() => handleEditClick(coupon)}>
                        수정
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
