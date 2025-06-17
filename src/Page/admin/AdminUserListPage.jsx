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
      setUsers(res.data || []);
    } catch (err) {
      console.error('유저 전체 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`이 사용자의 권한을 ${newRole}로 변경하시겠습니까?`))
      return;

    try {
      if (newRole === 'ADMIN') {
        await axiosInstance.post(
          `${API_BASE_URL}${USER}/convertAdmin/${userId}`,
        );
        alert('권한이 관리자(ADMIN)로 변경되었습니다.');
      } else if (newRole === 'USER') {
        await axiosInstance.post(
          `${API_BASE_URL}${USER}/convertUser/${userId}`,
        );
        alert('권한이 일반 사용자(USER)로 변경되었습니다.');
      }

      fetchUsers();
    } catch (err) {
      console.error('권한 변경 실패:', err);
      alert('권한 변경 중 오류가 발생했습니다.');
    }
  };

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
              <th>변경</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyMessage}>
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
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value='USER'>USER</option>
                      <option value='ADMIN'>ADMIN</option>
                    </select>
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

export default AdminUserListPage;
