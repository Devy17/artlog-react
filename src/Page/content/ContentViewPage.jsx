import { Card, CardMedia, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL } from '../../Axios/host-config';
import { createSearchParams, useNavigate } from 'react-router-dom';
import styles from './ContentViewPage.module.scss';

const ContentViewPage = () => {
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const navi = useNavigate();

  const numberOfContent = 9;

  // 다음 페이지에 데이터 있는지 미리 확인
  const peekNextPage = async (nextPage) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL}${API}/select?numOfRows=1&pageNo=${nextPage}`,
      );
      const length = res.data?.result?.length ?? 0;
      console.log(`peekNextPage: ${nextPage}페이지에 ${length}개 존재`);
      return length > 0;
    } catch (e) {
      console.warn(`peekNextPage 실패 (400 예상됨):`, e);
      return false;
    }
  };

  useEffect(() => {
    const getData = async () => {
      setWaiting(true);
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${API}/select?numOfRows=${numberOfContent}&pageNo=${page}`,
        );
        const data = response.data.result;
        console.log(`page ${page} → 받아온 데이터 수: ${data.length}`);

        if (!data || data.length === 0) {
          setIsLast(true);
          setCanLoadMore(false);
          alert('마지막입니다.');
          return;
        }

        setApiData((prev) => [...prev, ...data]);
        setLoading(true);

        // 다음 페이지 미리 확인 → 즉시 상태 갱신
        const hasNext = await peekNextPage(page + 1);
        setCanLoadMore(hasNext);
        if (!hasNext) {
          setIsLast(true);
        }
      } catch (error) {
        console.error('데이터 요청 실패', error);
        setIsLast(true);
        setCanLoadMore(false);
        alert('마지막입니다.');
      } finally {
        setWaiting(false);
      }
    };

    if (!isLast) {
      getData();
    }
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
      <div className={styles['card-grid']}>
        {loading ? (
          apiData.map((data, index) => (
            <div
              key={`${data.contentId}-${index}`}
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

      <div className={styles['button-section']}>
        {waiting ? (
          <div className={styles['load-circular-bar']}>
            <CircularProgress />
          </div>
        ) : (
          canLoadMore && (
            <button
              className={styles['load-more-button']}
              onClick={() => {
                setPage((prev) => prev + 1);
              }}
            >
              더보기
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ContentViewPage;
