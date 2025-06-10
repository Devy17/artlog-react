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


  console.log('ContentDetailPage searchParams:', searchParams.get('charge'));

  return (
    <>
      <div className={style['content-detail-page-wrapper']}>
        <Card className={style['content-title-card']}>
          <CardContent>
            {searchParams.get('title')} {/* 제목 표시 */}
          </CardContent>
        </Card>
        <div className={style['main-content']}>
          <CardMedia
            component='img' // img 태그로 렌더링
            src={searchParams.get('thumbnail')} // 썸네일 이미지 URL
            alt={searchParams.get('title') || '콘텐츠 썸네일 이미지'} // 이미지 대체 텍스트 추가
            onError={(e) => {
              e.target.src = 'no-img.png'; // 대체 이미지 경로
              e.target.onerror = null; // 오류 발생 시 무한 루프 방지
            }}
            className={style['content-image']} // ✅ SCSS 클래스 적용
          />
          <div>
            {' '}
            <div className={style['content-details-container']}>
              <div className={style['detail-item']}>
                {' '}
                <div className={style['detail-label']}>기간</div>{' '}
                <div className={style['detail-value']}>
                  {' '}
                  {searchParams.get('startDate') +
                    ' ~ ' +
                    searchParams.get('endDate')}
                </div>
              </div>
              <div className={style['detail-item']}>
                {' '}
                <div className={style['detail-label']}>장소</div>{' '}
                <div className={style['detail-value']}>
                  {searchParams.get('venue')}
                </div>{' '}
              </div>
              <div className={style['detail-item']}>
                {' '}
                <div className={style['detail-label']}>관람료</div>{' '}
                <div className={style['detail-value']}>
                  {' '}
                  {searchParams.get('charge') == '0'
                    ? '무료'
                    : searchParams.get('charge')}
                </div>
              </div>
              <div className={style['detail-item']}>
                {' '}
                <div className={style['detail-label']}>상세페이지</div>{' '}
                <div className={style['detail-value']}>
                  {' '}
                  {searchParams.get('url') ? ( // URL 값이 있을 경우에만 링크 표시
                    <a
                      href={searchParams.get('url')} // URL 주소
                      target='_blank' // 새 탭에서 열기
                      rel='noopener noreferrer' // 보안 속성
                      className={style['detail-link']} // ✅ 링크 SCSS 클래스 적용 (SCSS 파일에 정의 필요)
                    >
                      바로가기 
                    </a>
                  ) : (
                    '링크 정보 없음'
                  )}{' '}
                </div>
              </div>
              <button
                onClick={orderClickHandler}
                className={style['order-button']}
              >
                예매하기
              </button>
            </div>
          </div>
        </div>
        <div className={style['reviews-section']}>
          {' '}
           <WriteReview
            contentId={searchParams.get('id')}
            onSubmit={handleReviewSubmit} // ✅ 콜백 함수 전달 (prop 이름 일관성 유지)
          />
          <ShowReviews
            contentId={searchParams.get('id')}
            refreshKey={reviewRefreshKey} // ✅ 트리거 상태 전달 (prop 이름 일관성 유지)
          />
        </div>{' '}
      </div>
    </>
  );
};

export default ContentDetailPage;
