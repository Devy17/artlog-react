import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL, REVIEW } from '../../Axios/host-config';
import { Card } from '@mui/material';

const ShowReviews = ({ contentId, refreshKey }) => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(false);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${REVIEW}/findByContentId/${contentId}`,
        );
        setReviewData(response.data.result || []);
      } catch (e) {
        console.error('리뷰 로딩 실패', e);
      } finally {
        setLoading(true);
      }
    };

    getData();
  }, [contentId, refreshKey]); // ⭐ 트리거가 바뀔 때마다 재요청

  return (
    <>
      {loading ? (
        <div>
          {reviewData.map((data, i) => (
            <Card key={i} style={{ width: '90%', margin: '1rem 0', padding: '1rem' }}>
              {data.reviewContent}
            </Card>
          ))}
        </div>
      ) : (
        <div>리뷰 불러오는 중...</div>
      )}
    </>
  );
};

export default ShowReviews;