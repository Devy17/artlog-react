import React, { useEffect } from 'react';
import { ExAxiosInstance } from '../../Axios/ExAxiosConfig';
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Card, CardContent, CardMedia } from '@mui/material';
import WriteReview from '../../Component/content/WriteReview';
import ShowReviews from '../../Component/content/ShowReviews';

import styles from './ContentDetailPage.module.scss';

const ContentDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navi = useNavigate();

  const isPastOrToday = (endDate) => {
    const inputDate = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate <= today;
  };

  const orderClickHandler = () => {
    navi({
      pathname: '/order',
      search: '?' + createSearchParams(searchParams).toString(),
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <Card>
          <CardContent>{searchParams.get('title')}</CardContent>
        </Card>
      </div>

      <div className={styles.topSection}>
        <CardMedia
          component='img'
          src={searchParams.get('thumbnail')}
          onError={(e) => {
            e.target.src = 'no-img.png';
          }}
          className={styles.image}
        />
        <div className={styles.infoBox}>
          <div>기간</div>
          <div>
            {searchParams.get('startDate')} ~ {searchParams.get('endDate')}
          </div>
          <div>장소</div>
          <div>{searchParams.get('venue')}</div>
          <div>관람료</div>
          <div>
            {searchParams.get('charge') === '0'
              ? '무료'
              : searchParams.get('charge')}
          </div>
          <div>
            <a href={searchParams.get('url')} target='_blank' rel='noreferrer'>
              상세페이지
            </a>
          </div>
          <button
            className={styles.reserveBtn}
            style={
              isPastOrToday(searchParams.get('endDate'))
                ? { display: 'none' }
                : {}
            }
            onClick={orderClickHandler}
          >
            예매하기
          </button>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.sectionTitle}>전시 정보</div>
        <div className={styles.reviewBox}>
          <WriteReview contentId={searchParams.get('id')} />
          <ShowReviews contentId={searchParams.get('id')} />
        </div>
      </div>
    </div>
  );
};

export default ContentDetailPage;
