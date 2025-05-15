import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, REVIEW } from '../../Axios/host-config';

const WriteReview = ({ contentId, onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const postData = async () => {
      try {
        await axiosInstance.post(`${API_BASE_URL}${REVIEW}/insert`, {
          contentId,
          reviewContent: input.trim(),
        });

        setInput('');
        if (onSubmit) onSubmit(); // ⭐ 등록 후 알림
      } catch (e) {
        console.log(e);
      }
    };

    postData();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
      <TextField
        label='댓글을 입력하세요'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button type='submit' variant='contained'>등록</Button>
    </form>
  );
};

export default WriteReview;
