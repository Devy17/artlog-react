// src/pages/MyReviewsPage.jsx

import React, { useEffect, useState, useContext, useCallback } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig'; // 백엔드 API 인스턴스
import { API_BASE_URL, REVIEW } from '../../Axios/host-config'; // API 엔드포인트 상수
import AuthContext from '../../context/UserContext'; // ✅ AuthContext import
import styles from './MyReviewsPage.module.scss'; // ✅ 스타일 SCSS 모듈
import ModalContext from '../../Modal/ModalContext';
import { useNavigate, createSearchParams } from 'react-router-dom';

const MyReviewsPage = () => {
  // ✅ AuthContext 사용 및 필요한 상태/정보 구조 분해 할당
  const authCtx = useContext(AuthContext);
  const { isLoggedIn, isInit } = authCtx;
  const { setModalType } = useContext(ModalContext);
  const currentUserKey = localStorage.getItem('USER_ID');
  const token = localStorage.getItem('ACCESS_TOKEN');
  console.log('currentUserKey:', currentUserKey);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [reviewData, setReviewData] = useState([]);
  const [error, setError] = useState(null); // 오류 상태

  const navigate = useNavigate();
  const [displayList, setDisplayList] = useState([]);

  // ✅ 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10; // 페이지당 보여줄 리뷰 수 (백엔드 API 명세 확인)

  const displayedReviews = reviewData.slice(0, currentPage * itemsPerPage);
  const totalPages = Math.ceil(reviewData.length / itemsPerPage);

       // 4) 콘텐츠 상세로 이동
      const contentClickHandler = (review) => {
        const params = {
          id: review.contentId,
          title: review.contentTitle,
          venue: review.contentVenue,
          charge: review.contentCharge,
          period: review.contentPeriod,
          thumbnail: review.contentThumbnail,
          url: review.contentUrl,
          startDate: review.startDate,
          endDate: review.endDate,
        };
        navigate({
          pathname: '/contentDetail',
          search: '?' + createSearchParams(params).toString(),
        });
      };


  const fetchMyReviews = useCallback(async () => {
    if (!isLoggedIn || !currentUserKey || !token) {
      console.log(
        'fetchMyReviews: Skipping fetch due to authentication state or missing info.',
      );
      return;
    }

    setError(null);

    try {
      // ✅ REV_04 사용자 별 리뷰 조회 API 호출
      // TODO: 백엔드 API가 페이지네이션 파라미터 (page, size)를 지원한다면 여기에 params 추가
      const response = await axiosInstance.get(
        `${API_BASE_URL}${REVIEW}/findByUserKey/${currentUserKey}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // 예시: 페이지네이션 파라미터
          // params: {
          //   page: currentPage - 1, // 백엔드가 0부터 시작하는 페이지 번호를 기대한다면
          //   size: itemsPerPage,
          // },
        },
      );
      console.log('fetchMyReviews: API 응답 데이터:', response.data);

      // ✅ 응답 데이터 처리 (CommonResDto 형태 예상)
      // TODO: 실제 백엔드 응답 구조 (CommonResDto 등으로 감싸져 있는지, 페이지네이션 정보 위치 등)에 맞게 수정
      if (
        response.data &&
        response.data.statusCode === 200 &&
        Array.isArray(response.data.result)
      ) {
        const data = response.data.result;
        setReviewData(data); // 리뷰 목록 데이터 설정
        console.log(
          '✅ fetchMyReviews: 리뷰 데이터를 성공적으로 가져왔습니다.',
          data,
        );
      } else if (response.data && response.data.statusCode === 404) {
        // 요구사항 명세의 404 오류 처리 (리뷰가 없는 경우)
        console.log(
          '✅ fetchMyReviews: 해당 사용자가 작성한 리뷰가 없습니다. (404 응답)',
        ); // ✅ 리뷰 없음 로그
        setReviewData([]); // 리뷰 목록 비움
        setError(null); // 404는 오류로 표시하지 않음 (데이터 없음 상태)
      } else if (response.data && response.data.statusCode !== undefined) {
        // 백엔드가 2xx 응답을 보냈으나 비즈니스 로직 오류 (예: 200 OK인데 statusMessage로 오류 전달)
        const backendErrorMessage =
          response.data.statusMessage || '예상치 못한 백엔드 오류';
        console.error(
          'fetchMyReviews: 리뷰 로딩 실패 - 백엔드 오류 응답:',
          response.data,
        ); // 오류 로그
        setError(backendErrorMessage); // 오류 메시지 설정
        setReviewData([]); // 오류 발생 시 목록 비움
      } else {
        // 예상치 못한 응답 형식 (예: CommonResDto 구조가 아님)
        console.error(
          'fetchMyReviews: 리뷰 로딩 실패 - 예상치 못한 응답 형식:',
          response.data,
        ); // 오류 로그
        setError('리뷰 데이터를 가져오는데 실패했습니다.'); // 오류 메시지 설정
        setReviewData([]); // 오류 발생 시 목록 비움
      }
    } catch (err) {
      console.error('fetchMyReviews: Error fetching my reviews:', err); // 오류 로그
      if (err.response) {
        const httpStatus = err.response.status;
        const backendErrorMessage =
          err.response.data?.statusMessage || `HTTP 오류 (${httpStatus})`;

        if (httpStatus === 401 || httpStatus === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else if (httpStatus === 404) {
          console.log('✅ 리뷰 없음: 404 처리 완료');
          setReviewData([]); // 빈 배열 설정
          setError(null); // ❌ 오류로 간주하지 않음
        } else {
          setError(`리뷰 로딩 실패: ${backendErrorMessage}`);
          setReviewData([]);
        }
      }
    } finally {
      // ✅ 로딩 상태 종료 제거
      // setLoading(false); // ✅ 로딩 종료 (성공/실패/데이터 없음/오류 모두)
      console.log('fetchMyReviews: API 요청 완료.'); // ✅ finally 로그 추가
    }
  }, [
    isLoggedIn,
    currentUserKey,
    token,
    currentPage,
    authCtx.onLogout,
    setModalType,
  ]); // ✅ 의존성 업데이트: Context 함수들도 포함

  // ✅ reviewData 상태 변화 감지 및 로그 출력 useEffect
  useEffect(() => {
    console.log('✅ reviewData 상태 업데이트:', reviewData);
  }, [reviewData]); // reviewData 상태가 변경될 때마다 실행

  // ✅ 리뷰 데이터 로딩 useEffect (AuthContext의 isInit, isLoggedIn 상태 활용)
  useEffect(() => {
    console.log('MyReviewsPage useEffect triggered', {
      isInit,
      isLoggedIn,
      currentPage,
    });
    // AuthContext 초기화가 완료된 후에 로그인 상태를 확인합니다.
    if (isInit) {
      // 로그인 상태일 경우 fetchMyReviews 호출
      if (isLoggedIn) {
        fetchMyReviews();
        // ✅ useEffect에서는 로딩 상태를 관리하지 않음
      } else {
        // 로그인되지 않은 상태일 경우 (isInit === true && isLoggedIn === false)
        // ✅ 로딩 상태 설정 제거
        // setLoading(false); // 로딩 중지
        setReviewData([]); // 데이터 비움
        setError('로그인이 필요한 페이지입니다.'); // 로그인 필요 메시지 설정
        setModalType('login');
      }
    } else {
      // isInit이 false일 때는 Context 초기화 중이므로 로딩 메시지 표시 (이 초기 로딩 메시지는 유지)
      // ✅ 초기 로딩 상태 설정 제거
      // setLoading(true); // 초기화 중에는 로딩 표시
      setReviewData([]); // 데이터 비움
      setError(null); // 오류 없음
    }
  }, [isInit, isLoggedIn, fetchMyReviews, authCtx.onLogout, setModalType]); // ✅ 의존성 업데이트: Context 함수들도 포함

  const handleEditReview = (reviewId) => {
    const target = reviewData.find((r) => r.id === reviewId);
    if (!target) return;
    setEditingReviewId(reviewId);
    setEditingContent(target.reviewContent || '');
  };

  const handleSaveEditedReview = async () => {
    if (!editingReviewId || !editingContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}${REVIEW}/update/${editingReviewId}`,
        { reviewContent: editingContent }, // ← DTO 필드명 확인 필요!
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data?.statusCode === 200) {
        alert('리뷰가 수정되었습니다.');
        setEditingReviewId(null);
        setEditingContent('');
        fetchMyReviews(); // 목록 새로고침
      } else {
        alert(response.data?.statusMessage || '리뷰 수정 실패');
      }
    } catch (err) {
      console.error('리뷰 수정 오류:', err);
      alert('리뷰 수정 중 문제가 발생했습니다.');
    }
  };

  // ✅ 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    console.log(`리뷰 삭제 버튼 클릭: ${reviewId}`);
    const confirmDelete = window.confirm('정말로 이 리뷰를 삭제하시겠습니까?');
    if (!confirmDelete) return;

    if (!isLoggedIn || !currentUserKey || !token) {
      alert('로그인이 필요하거나 인증 정보가 유효하지 않습니다.');
      authCtx.onLogout(); // ✅ Context의 onLogout 사용
      setModalType('login');
      return;
    }

   

    try {
      // ✅ 리뷰 삭제 API 호출 (DELETE /review/delete/{id})
      // 컨트롤러 명세에 따라 엔드포인트 수정
      const response = await axiosInstance.delete(
        `${API_BASE_URL}${REVIEW}/delete/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Context에서 가져온 authToken 사용
        },
      );

      // ✅ 백엔드 응답 확인 (CommonResDto 형태 가정)
      if (response.data && response.data.statusCode === 200) {
        alert(
          response.data.statusMessage || '리뷰가 성공적으로 삭제되었습니다.',
        );
        fetchMyReviews(); // ✅ 목록 갱신 호출
      } else if (response.data && response.data.statusCode !== undefined) {
        const backendErrorMessage =
          response.data.statusMessage || '예상치 못한 백엔드 오류';
        console.error(
          'handleDeleteReview: 리뷰 삭제 실패 - 백엔드 오류:',
          response.data,
        ); // 오류 로그
        alert(backendErrorMessage || '리뷰 삭제에 실패했습니다.');
      } else {
        console.error(
          'handleDeleteReview: 리뷰 삭제 실패 - 예상치 못한 응답:',
          response.data,
        ); // 오류 로그
        alert('리뷰 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('handleDeleteReview: 리뷰 삭제 요청 중 오류 발생:', err); // 오류 로그
      if (err.response) {
        const httpStatus = err.response.status;
        const backendErrorMessage =
          err.response.data && err.response.data.statusMessage
            ? err.response.data.statusMessage
            : `HTTP 오류 (${httpStatus})`;

        if (httpStatus === 401 || httpStatus === 403) {
          alert('로그인이 필요하거나 권한이 없습니다.');
          authCtx.onLogout(); // ✅ Context의 onLogout 사용
          setModalType('login');
        } else if (httpStatus === 404) {
          alert(backendErrorMessage || '삭제하려는 리뷰를 찾을 수 없습니다.');
          fetchMyReviews(); // ✅ 목록 갱신 호출 (404 발생 시)
        } else {
          alert(
            `리뷰 삭제 요청 중 오류가 발생했습니다: ${backendErrorMessage}`,
          );
        }
      } else {
        alert('네트워크 오류로 리뷰 삭제 요청에 실패했습니다.');
      }
    } finally {
      console.log('handleDeleteReview: API 요청 완료.'); // ✅ finally 로그 추가
    }
  };

  return (
    <div className={styles['my-reviews-page-wrapper']}>
      <h2 className={styles['page-title']}>내가 작성한 리뷰</h2>

      {/* 1) Context 초기화 전 */}
      {!isInit && (
        <p className={styles['info-message']}>
          인증 정보를 확인하는 중입니다...
        </p>
      )}

      {/* 2) 초기화 완료 후, 미로그인 상태 */}
      {isInit && !isLoggedIn && (
        <p className={styles['error-message']}>로그인이 필요한 페이지입니다.</p>
      )}

      {/* 3) 초기화 완료 & 로그인 상태 */}
      {isInit && isLoggedIn && (
        <>
          {/* 오류 메시지 */}
          {error && <p className={styles['error-message']}>{error}</p>}

          {/* 정상 상태 */}
          {!error && (
            <>
              {/* 3-1) 리뷰 리스트 */}
              {displayedReviews.length > 0 ? (
                <div className={styles['reviews-list']}>
                  {displayedReviews.map((review) => (
                    <div key={review.id} 
                    className={styles['review-item']}
                    onClick={() => contentClickHandler(review)}
                    style={{ cursor: 'pointer' }}
                    >
                    
                      <div className={styles['item-image-container']}>
                        <img
                          src={
                            review.contentThumbnail ||
                            'https://img.icons8.com/?size=100&id=y-ATLB0FBoe1&format=png&color=000000'
                          }
                          className={styles['item-image']}
                          onError={(e) => {
                            e.target.src =
                              'https://img.icons8.com/?size=100&id=y-ATLB0FBoe1&format=png&color=000000';
                          }}
                        />
                      </div>

                      {/* 상세 정보 */}
                      <div className={styles['item-details']}>
                        <div className={styles['item-place-date']}>
                          {`콘텐츠 아이디: ${review.contentId}`}
                        </div>

                        {/* 수정 중이면 textarea, 아니면 텍스트 */}
                        {editingReviewId === review.id ? (
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className={styles['edit-textarea']}
                            maxLength={1000}
                            placeholder='리뷰를 입력하세요'
                          />
                        ) : (
                          <div className={styles['item-content']}>
                            {review.reviewContent || '리뷰 내용 없음'}
                          </div>
                        )}

                        <div className={styles['item-date']}>
                          {review.updateDate
                            ? `작성일: ${new Date(
                                review.updateDate,
                              ).toLocaleDateString()}`
                            : '날짜 정보 없음'}
                        </div>

                        {/* 버튼 영역 */}
                        <div className={styles['item-actions']}>
                          {editingReviewId === review.id ? (
                            <>
                              <button
                                onClick={handleSaveEditedReview}
                                className={styles['save-button']}
                              >
                                저장
                              </button>
                              <button
                                onClick={() => setEditingReviewId(null)}
                                className={styles['cancel-button']}
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className={styles['delete-button']}
                              >
                                리뷰 삭제하기
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditReview(review.id)}
                                className={styles['edit-button']}
                              >
                                리뷰 수정하기
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className={styles['delete-button']}
                              >
                                리뷰 삭제하기
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles['info-message']}>
                  작성하신 리뷰가 없습니다.
                </p>
              )}

              {/* 3-2) 더보기 버튼 */}
              {displayedReviews.length < reviewData.length && (
                <div className={styles['load-more-wrapper']}>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className={styles['load-more-button']}
                  >
                    더보기
                    
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyReviewsPage;