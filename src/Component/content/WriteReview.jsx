// src/Component/content/WriteReview.jsx
import React, { useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, REVIEW } from '../../Axios/host-config';
import style from './WriteReview.module.scss'; // SCSS 파일 임포트

const WriteReview = ({ contentId, onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      await axiosInstance.post(`${API_BASE_URL}${REVIEW}/insert`, {
        contentId,
        reviewContent: input.trim(),
      });

      setInput('');
      if (onSubmit) onSubmit();
    } catch (e) {
      console.error('리뷰 등록 실패:', e);
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={style['write-review-form']}> {/* SCSS 클래스 적용 */}
      <textarea
        className={style['review-textarea']} // SCSS 클래스 적용
        placeholder="댓글을 입력하세요"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3} // 높이 조절을 위해 rows 속성 추가 (SCSS로도 조절 가능)
      />
      <button
        type='submit'
        className={style['submit-review-button']} // SCSS 클래스 적용
        disabled={!input.trim()}
      >
        등록
      </button>
    </form>
  );
};

export default WriteReview;