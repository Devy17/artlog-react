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

  // src/pages/ContentDetailPage.jsx 파일의 return 부분

  return (
    <>
      {/* ✅ 페이지 전체 컨테이너: style['content-detail-page'] -> style['content-detail-page-wrapper'] */}
      <div className={style['content-detail-page-wrapper']}>
        {/* ✅ 타이틀 영역 Card: style['title-card'] -> style['content-title-card'] */}
        <Card className={style['content-title-card']}>
          {/* CardContent는 내용을 담는 역할만 하고 별도 클래스 필요 없거나, 필요시 style['content-title'] */}
          <CardContent>
            {searchParams.get('title')} {/* 제목 표시 */}
          </CardContent>
        </Card>
        {/* ✅ 이미지와 상세 정보 섹션 컨테이너: style['content-section'] -> style['main-content'] */}
        <div className={style['main-content']}>
          {/* ✅ 이미지 (CardMedia): SCSS에서 width, height, object-fit 등 스타일 관리 */}
          <CardMedia
            component='img' // img 태그로 렌더링
            src={searchParams.get('thumbnail')} // 썸네일 이미지 URL
            alt={searchParams.get('title') || '콘텐츠 썸네일 이미지'} // 이미지 대체 텍스트 추가
            onError={(e) => {
              // 이미지 로딩 오류 시 대체 이미지 표시
              e.target.src = 'no-img.png'; // 대체 이미지 경로
              e.target.onerror = null; // 오류 발생 시 무한 루프 방지
            }}
            className={style['content-image']} // ✅ SCSS 클래스 적용
            // 기존 인라인 style={{ width: '50%', height: 800, objectFit: 'cover' }} 제거 또는 SCSS와 조율
          />
          {/* 상세 정보와 예매하기 버튼을 담는 오른쪽 영역 */}
          <div>
            {' '}
            {/* 이 div 자체는 SCSS 클래스 없어도 됩니다 */}
            {/* ✅ 상세 정보 항목들을 감싸는 컨테이너: style['info-box'] -> style['content-details-container'] */}
            <div className={style['content-details-container']}>
              {/* ✅ 각 상세 정보 항목 구조 변경 및 SCSS 클래스 적용 */}
              {/* 기존: <div>기간</div> <div>{날짜}</div> */}
              {/* 변경: <div className="detail-item"><div className="detail-label">기간</div><div className="detail-value">{날짜}</div></div> */}

              {/* 기간 정보 항목 */}
              <div className={style['detail-item']}>
                {' '}
                {/* ✅ SCSS 클래스 적용 */}
                <div className={style['detail-label']}>기간</div>{' '}
                {/* ✅ 라벨 SCSS 클래스 적용 */}
                <div className={style['detail-value']}>
                  {' '}
                  {/* ✅ 값 SCSS 클래스 적용 */}
                  {searchParams.get('startDate') +
                    ' ~ ' +
                    searchParams.get('endDate')}
                </div>
              </div>
              {/* 장소 정보 항목 */}
              <div className={style['detail-item']}>
                {' '}
                {/* ✅ SCSS 클래스 적용 */}
                <div className={style['detail-label']}>장소</div>{' '}
                {/* ✅ 라벨 SCSS 클래스 적용 */}
                <div className={style['detail-value']}>
                  {searchParams.get('venue')}
                </div>{' '}
                {/* ✅ 값 SCSS 클래스 적용 */}
              </div>
              {/* 관람료 정보 항목 */}
              <div className={style['detail-item']}>
                {' '}
                {/* ✅ SCSS 클래스 적용 */}
                <div className={style['detail-label']}>관람료</div>{' '}
                {/* ✅ 라벨 SCSS 클래스 적용 */}
                <div className={style['detail-value']}>
                  {' '}
                  {/* ✅ 값 SCSS 클래스 적용 */}
                  {searchParams.get('charge') == '0'
                    ? '무료'
                    : searchParams.get('charge')}
                </div>
              </div>
              {/* 상세페이지 링크 항목 */}
              <div className={style['detail-item']}>
                {' '}
                {/* ✅ SCSS 클래스 적용 */}
                <div className={style['detail-label']}>상세페이지</div>{' '}
                {/* ✅ 라벨 SCSS 클래스 적용 */}
                <div className={style['detail-value']}>
                  {' '}
                  {/* ✅ 값 SCSS 클래스 적용 */}
                  {searchParams.get('url') ? ( // URL 값이 있을 경우에만 링크 표시
                    <a
                      href={searchParams.get('url')} // URL 주소
                      target='_blank' // 새 탭에서 열기
                      rel='noopener noreferrer' // 보안 속성
                      className={style['detail-link']} // ✅ 링크 SCSS 클래스 적용 (SCSS 파일에 정의 필요)
                    >
                      바로가기 {/* 링크 텍스트 변경 */}
                    </a>
                  ) : (
                    '링크 정보 없음'
                  )}{' '}
                  {/* URL 없을 시 대체 텍스트 */}
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
        {/* ✅ 리뷰 섹션 컨테이너: style['review-section'] -> style['reviews-section'] */}
        {/* 사용자 코드에는 WriteReview와 ShowReviews 위에 빈 div가 있었으나, 클래스는 이 컨테이너에 적용 */}
        <div className={style['reviews-section']}>
          {' '}
          {/* ✅ SCSS 클래스 적용 */}
          {/* WriteReview 컴포넌트: contentId와 리뷰 등록 성공 시 호출할 함수 전달 */}
          {/* ✅ onSubmit -> onReviewSubmitted 또는 원하는 prop 이름으로 변경하여 사용 */}
          {/* ✅ handleReviewSubmit -> handleReviewSubmitted 또는 원하는 함수 이름 사용 */}
          <WriteReview
            contentId={searchParams.get('id')}
            onSubmit={handleReviewSubmit} // ✅ 콜백 함수 전달 (prop 이름 일관성 유지)
          />
          {/* ShowReviews 컴포넌트: contentId와 리뷰 목록 갱신 트리거 전달 */}
          {/* ✅ refreshKey -> refreshDependency 또는 원하는 prop 이름으로 변경하여 사용 */}
          <ShowReviews
            contentId={searchParams.get('id')}
            refreshKey={reviewRefreshKey} // ✅ 트리거 상태 전달 (prop 이름 일관성 유지)
          />
        </div>{' '}
        {/* reviews-section div 종료 */}
      </div>
    </>
  );
};

export default ContentDetailPage;
