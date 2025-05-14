import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, REVIEW } from '../../Axios/host-config';

const WriteReview = ({ contentId }) => {
  const [input, setInput] = useState('');

  localStorage.setItem(
    'ACCESS_TOKEN',
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQ3MjE1NDQ1LCJleHAiOjE3NDcyMjI2NDUsInJvbGUiOiJVU0VSIn0.jMErQUj4ludjxkg9Iq2Kf19ZwNv31wKGs8T4UOpssBgK861c5pt0jwflLv46yTcZDlX_4EdQ8_y8crKiWLXmNQ',
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(contentId);

    const postData = async (id, input) => {
      try {
        await axiosInstance
          .post(`${API_BASE_URL}${REVIEW}/insert`, {
            contentId: id,
            reviewContent: input.trim(),
          })
          .then((response) => console.log(response.data));
      } catch (e) {
        console.log(e);
      }
    };

    postData(contentId, input);
  };
  return (
    <>
      <div>
        <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
          <TextField
            label='댓글을 입력하세요'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type='submit' variant='contained' sx={{ mt: 1 }}>
            등록
          </Button>
        </form>
      </div>
    </>
  );
};

export default WriteReview;
