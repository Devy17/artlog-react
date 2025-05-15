import { Card, CardMedia } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL } from '../../Axios/host-config';
import { createSearchParams, useNavigate } from 'react-router-dom';
import styles from './ContentViewPage.module.scss';

const ContentViewPage = () => {
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, isLoading] = useState(false);
  const navi = useNavigate();

  const numberOfContent = 9;

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${API}/select?numOfRows=${numberOfContent}&pageNo=${page}`,
        );
        const newData = response.data.result;
        setApiData((prev) => [...prev, ...newData]);
        isLoading(true);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    getData();
  }, [page]);

  const contentClickHandler = (data) => {
    const param = {
      id: data.contentId,
      title: data.contentTitle,
      venue: data.contentVenue,
      charge: data.contentCharge,
      period: data.contentPeriod,
      thumbnail: data.contentThumbnail,
      url: data.contentUrl,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    navi({
      pathname: '/contentDetail',
      search: '?' + createSearchParams(param).toString(),
    });
  };

  return (
    <div className={styles['content-view-page']}>
      <h2 className={styles['page-title']}>전시 정보</h2>
      <div className={styles['filter-sort-area']}>최신순</div>
      <div className={styles['card-grid']}>
        {loading ? (
          apiData.map((data) => (
            <div
              key={data.contentId}
              className={styles['content-item']}
              onClick={() => contentClickHandler(data)}
            >
              <Card className={styles.card}>
                <CardMedia
                  component='img'
                  image={data.contentThumbnail}
                  alt={data.contentTitle}
                  className={styles['item-image']}
                  onError={(e) => {
                    e.target.src = 'no-img.png';
                  }}
                />
                <div className={styles['item-textbox']}>
                  <div className={styles['item-title']}>
                    {data.contentTitle}
                  </div>
                  <div className={styles['item-details']}>
                    {data.contentVenue}
                  </div>
                </div>
              </Card>
            </div>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <button
        className={styles['load-more-button']}
        onClick={() => setPage(page + 1)}
      >
        더보기
      </button>
    </div>
  );
};

export default ContentViewPage;
