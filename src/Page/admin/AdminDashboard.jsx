import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card} onClick={() => navigate('/admin/users')}>
        유저조회
      </div>
      <div className={styles.card} onClick={() => navigate('/admin/coupons')}>
        쿠폰조회
      </div>
      <div
        className={styles.card}
        onClick={() => navigate('/admin/coupon-register')}
      >
        쿠폰생성
      </div>
    </div>
  );
};

export default AdminDashboard;
