import React, { useEffect, useState } from 'react';
import { ExAxiosInstance } from '../../Axios/ExAxiosConfig';
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Card, CardContent, CardMedia } from '@mui/material';
import WriteReview from '../../Component/content/WriteReview';
import ShowReviews from '../../Component/content/ShowReviews';
import style from './ContentDetailPage.module.scss';

const ContentDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navi = useNavigate();

  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const handleReviewSubmit = () => {
    setReviewRefreshKey((prev) => prev + 1); // 리뷰 작성 시 key 증가 → ShowReviews 다시 실행
  };

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
    <div className={style['content-detail-page']}>
      <Card className={style['title-card']}>
        <CardContent>{searchParams.get('title')}</CardContent>
      </Card>

      <div className={style['content-section']}>
        <CardMedia
          component='img'
          src={searchParams.get('thumbnail')}
          onError={(e) => {
            e.target.src = 'no-img.png';
          }}
        />
        <div>
          <div className={style['info-box']}></div>
          <div>기간</div>
          <div>
            {searchParams.get('startDate') +
              ' ~ ' +
              searchParams.get('endDate')}
          </div>
          <div>장소</div>
          <div>{searchParams.get('venue')}</div>
          <div>관람료</div>
          <div>
            {searchParams.get('charge') == '0'
              ? '무료'
              : searchParams.get('charge')}
          </div>
          <div>
            <a href={searchParams.get('url')}>상세페이지</a>
          </div>
          <button
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

      <div className={style['review-section']}></div>
      <WriteReview
        contentId={searchParams.get('id')}
        onSubmit={handleReviewSubmit} // ⭐ 콜백 전달
      />
      <ShowReviews
        contentId={searchParams.get('id')}
        refreshKey={reviewRefreshKey} // ⭐ key 전달
      />
    </div>
  );
};

export default ContentDetailPage;