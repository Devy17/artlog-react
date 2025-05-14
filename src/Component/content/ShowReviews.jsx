import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL, REVIEW } from '../../Axios/host-config';
import { Card } from '@mui/material';

const ShowReviews = ({ contentId }) => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, isLoading] = useState(false);

  //  테스트 용도
  localStorage.setItem(
    'ACCESS_TOKEN',
    'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQ3MjE1NDQ1LCJleHAiOjE3NDcyMjI2NDUsInJvbGUiOiJVU0VSIn0.jMErQUj4ludjxkg9Iq2Kf19ZwNv31wKGs8T4UOpssBgK861c5pt0jwflLv46yTcZDlX_4EdQ8_y8crKiWLXmNQ',
  );

  useEffect(() => {
    const getData = async () => {
      localStorage.setItem(
        'ACCESS_TOKEN',
        'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQ3MjE1NDQ1LCJleHAiOjE3NDcyMjI2NDUsInJvbGUiOiJVU0VSIn0.jMErQUj4ludjxkg9Iq2Kf19ZwNv31wKGs8T4UOpssBgK861c5pt0jwflLv46yTcZDlX_4EdQ8_y8crKiWLXmNQ',
      );
      const response = await axiosInstance.get(
        `${API_BASE_URL}${REVIEW}/findByContentId/${contentId}`,
      );
      const data = response.data.result;
      return data;
    };

    getData().then((response) => {
      setReviewData((prev) => [...prev, ...response]);
    });
  }, []);

  useEffect(() => isLoading(true), [reviewData]);

  return (
    <>
      {loading ? (
        <div>
          {reviewData.map((data) => (
            <Card style={{ width: '90%', height: 300 }}>
              {data.reviewContent}
            </Card>
          ))}
        </div>
      ) : (
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo minus
          itaque iure at dolores pariatur eaque consequuntur nemo a ducimus
          quos, quas omnis culpa nisi adipisci? Harum maiores eos nostrum!
        </div>
      )}
      {/*  */}
    </>
  );
};

export default ShowReviews;
