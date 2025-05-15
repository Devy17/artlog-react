import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL, REVIEW } from '../../Axios/host-config';
import { Card } from '@mui/material';

const ShowReviews = ({ contentId }) => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, isLoading] = useState(false);


  useEffect(() => {
    const getData = async () => {
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
