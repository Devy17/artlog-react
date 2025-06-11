// src/Page/admin/AdminDashboard.jsx
import React from 'react';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
  return (
    <div className={styles.wrapper}>
      <h1>관리자 대시보드</h1>
      <p>여기는 관리자만 접근할 수 있는 페이지입니다.</p>
    </div>
  );
};

export default AdminDashboard;
