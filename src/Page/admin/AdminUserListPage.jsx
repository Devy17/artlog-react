import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import styles from './AdminUserListPage.module.scss';
import { API_BASE_URL, USER } from '../../Axios/host-config';

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${USER}/findAllUsers`,
      );
      console.log(res);
      setUsers(res.data || []);
    } catch (err) {
      console.error('유저 전체 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <h1>전체 유저 조회</h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>이름</th>
              <th>권한</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyMessage}>
                  조회된 유저가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserListPage;
