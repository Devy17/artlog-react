// import React, { useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthContext from '../../content/UserContext';
// import axios from 'axios';
// import { API_BASE_URL, USER } from '../../Axios/host-config';

// const UpdatePasswordPage = () => {
//   const { user, setUser } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const loggedInUserId = localStorage.getItem("USER_ID");

//     if (newPassword !== confirmPassword) {
//       setErrorMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
//       return;
//     }

//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}${USER}/updatePw/${loggedInUserId}`,
//         {
//           currentPassword,
//           newPassword,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         alert('비밀번호가 성공적으로 변경되었습니다.');
//         navigate('/mypage');
//       }
//     } catch (error) {
//       console.error(error);
//       setErrorMessage('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
//     }
//   }  
// };