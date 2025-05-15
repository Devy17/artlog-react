import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, REVIEW } from '../../Axios/host-config';

const WriteReview = ({ contentId }) => {
  const [input, setInput] = useState('');
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
