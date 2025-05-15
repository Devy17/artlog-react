// src/pages/MyReviewsPage.jsx

import React, { useEffect, useState, useContext, useCallback } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig'; // 백엔드 API 인스턴스
import { API_BASE_URL, REVIEW } from '../../Axios/host-config'; // API 엔드포인트 상수
import AuthContext from '../../context/UserContext'; // ✅ AuthContext import
import styles from './MyReviewsPage.module.scss'; // ✅ 스타일 SCSS 모듈
import ModalContext from '../../Modal/ModalContext';


const MyReviewsPage = () => {

  // ✅ AuthContext 사용 및 필요한 상태/정보 구조 분해 할당
  const authCtx = useContext(AuthContext);
  const { isLoggedIn,isInit } = authCtx;
  const { setModalType } = useContext(ModalContext);
   const currentUserKey = localStorage.getItem('USER_ID');
   const token = localStorage.getItem('ACCESS_TOKEN');
  console.log("currentUserKey:", currentUserKey);

  const [reviewData, setReviewData] = useState([]);
  // ✅ loading 상태 제거
  // const [loading, setLoading] = useState(true); // 초기 로딩 상태는 true
  const [error, setError] = useState(null); // 오류 상태

  // ✅ 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  // TODO: 백엔드 응답에서 실제 총 페이지 수를 받아오도록 수정
  const [totalPages, setTotalPages] = useState(1); // 초기값은 1
  // TODO: 백엔드 API가 페이지당 항목 수를 파라미터로 받는다면 활용
  const itemsPerPage = 5; // 페이지당 보여줄 리뷰 수 (백엔드 API 명세 확인)


  // ✅ fetchMyReviews 함수를 useCallback으로 감싸서 의존성 변경 시에만 함수가 새로 생성되도록 합니다.
  // 이 함수는 isLoggedIn, currentUserKey, authToken, currentPage에 의존합니다.
  const fetchMyReviews = useCallback(async () => {
    // ✅ Context에서 가져온 값을 기반으로 인증 정보 체크
    if (!isLoggedIn || !currentUserKey || !token) {
      // Context 상태가 로그인 상태가 아니거나, 필요한 정보가 없는 경우 API 호출 건너뛰기
      console.log("fetchMyReviews: Skipping fetch due to authentication state or missing info.");
      // 이 경우는 useEffect에서 이미 상태를 처리하고 있으므로 여기서 추가 상태 변경은 최소화
      return;
    }

    // ✅ 로딩 상태 설정 제거
    // setLoading(true); // ✅ 로딩 시작 (API 호출 직전에만 설정)
    setError(null); // ✅ 오류 초기화 (fetch 시작 시 오류 초기화)

    try {
      // ✅ REV_04 사용자 별 리뷰 조회 API 호출
      // TODO: 백엔드 API가 페이지네이션 파라미터 (page, size)를 지원한다면 여기에 params 추가
      const response = await axiosInstance.get(
        `${API_BASE_URL}${REVIEW}/findByUserKey/${currentUserKey}`, // ✅ Context에서 가져온 userKey 사용
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Context에서 가져온 authToken 사용
          // 예시: 페이지네이션 파라미터
          // params: {
          //   page: currentPage - 1, // 백엔드가 0부터 시작하는 페이지 번호를 기대한다면
          //   size: itemsPerPage,
          // },
        },
      );

      // ✅ 응답 데이터 처리 (CommonResDto 형태 예상)
      // TODO: 실제 백엔드 응답 구조 (CommonResDto 등으로 감싸져 있는지, 페이지네이션 정보 위치 등)에 맞게 수정
      if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.result)) {
        const data = response.data.result;
        setReviewData(data); // 리뷰 목록 데이터 설정
        console.log("✅ fetchMyReviews: 리뷰 데이터를 성공적으로 가져왔습니다.", data); // ✅ 데이터 가져오기 성공 로그

        // TODO: 백엔드 응답에 총 페이지 수 정보가 있다면 setTotalPages(response.data.totalPages) 등으로 설정
        // 예시: const totalReviews = response.data.totalElements; // totalElements 등 필드명 확인
        // 예시: setTotalPages(Math.ceil(totalReviews / itemsPerPage));

      } else if (response.data && response.data.statusCode === 404) {
        // 요구사항 명세의 404 오류 처리 (리뷰가 없는 경우)
        console.log("✅ fetchMyReviews: 해당 사용자가 작성한 리뷰가 없습니다. (404 응답)"); // ✅ 리뷰 없음 로그
        setReviewData([]); // 리뷰 목록 비움
        setError(null); // 404는 오류로 표시하지 않음 (데이터 없음 상태)
        // setTotalPages(1); // 총 페이지 수도 1로 설정
      }
      else if (response.data && response.data.statusCode !== undefined) {
        // 백엔드가 2xx 응답을 보냈으나 비즈니스 로직 오류 (예: 200 OK인데 statusMessage로 오류 전달)
        const backendErrorMessage = response.data.statusMessage || '예상치 못한 백엔드 오류';
        console.error("fetchMyReviews: 리뷰 로딩 실패 - 백엔드 오류 응답:", response.data); // 오류 로그
        setError(backendErrorMessage); // 오류 메시지 설정
        setReviewData([]); // 오류 발생 시 목록 비움
        // setTotalPages(1);
      }
      else {
        // 예상치 못한 응답 형식 (예: CommonResDto 구조가 아님)
        console.error("fetchMyReviews: 리뷰 로딩 실패 - 예상치 못한 응답 형식:", response.data); // 오류 로그
        setError('리뷰 데이터를 가져오는데 실패했습니다.'); // 오류 메시지 설정
        setReviewData([]); // 오류 발생 시 목록 비움
        // setTotalPages(1);
      }


    } catch (err) {
      // ✅ API 호출 중 발생한 예외 처리 (네트워크 오류, 4xx/5xx HTTP 상태 코드 등)
      console.error("fetchMyReviews: Error fetching my reviews:", err); // 오류 로그
      if (err.response) {
        const httpStatus = err.response.status;
        console.error("fetchMyReviews: 리뷰 로딩 실패 - HTTP 응답 상세:", httpStatus, err.response.data); // 상세 오류 로그
        const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : `HTTP 오류 (${httpStatus})`;

        if (httpStatus === 401 || httpStatus === 403) {
          setError('로그인이 필요하거나 권한이 없습니다.'); // 오류 메시지 설정
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else {
          setError(`리뷰 로딩 실패: ${backendErrorMessage}`); // 오류 메시지 설정
        }
      } else {
        setError('네트워크 오류로 리뷰를 가져올 수 없습니다.'); // 오류 메시지 설정
      }
      setReviewData([]); // 오류 발생 시 목록 비움
      // setTotalPages(1);

    } finally {
      // ✅ 로딩 상태 종료 제거
      // setLoading(false); // ✅ 로딩 종료 (성공/실패/데이터 없음/오류 모두)
      console.log("fetchMyReviews: API 요청 완료."); // ✅ finally 로그 추가
    }
  }, [isLoggedIn, currentUserKey, token, currentPage, authCtx.onLogout, setModalType]); // ✅ 의존성 업데이트: Context 함수들도 포함


  // ✅ reviewData 상태 변화 감지 및 로그 출력 useEffect
  useEffect(() => {
    console.log('✅ reviewData 상태 업데이트:', reviewData);
  
  }, [reviewData]); // reviewData 상태가 변경될 때마다 실행


  // ✅ 리뷰 데이터 로딩 useEffect (AuthContext의 isInit, isLoggedIn 상태 활용)
  // 이 useEffect는 Context 상태가 변경될 때마다 fetchMyReviews를 호출할지 결정합니다.
  useEffect(() => {
    console.log("MyReviewsPage useEffect triggered", { isInit, isLoggedIn, currentPage });
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

    // useEffect 클린업 함수 (필요시)
    // return () => { /* 컴포넌트 언마운트 시 로딩 취소 로직 등 */ };

  }, [isInit, isLoggedIn, fetchMyReviews, authCtx.onLogout, setModalType]); // ✅ 의존성 업데이트: Context 함수들도 포함


  // 페이지 변경 핸들러 (페이지네이션 UI 클릭 시 호출)
  const handlePageChange = (pageNumber) => {
    // TODO: 백엔드 API가 페이지네이션을 지원하는 경우에만 유효한 로직
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 리뷰 수정 핸들러 (실제 기능 연결 필요)
  const handleEditReview = (reviewId) => {
    console.log(`리뷰 수정 버튼 클릭: ${reviewId}`);
    // TODO: 리뷰 수정 페이지 또는 모달로 이동/표시 로직 구현
    // 예: navigate(`/edit-review/${reviewId}`);
  };

  // 리뷰 삭제 핸들러 (실제 기능 연결 필요)
  const handleDeleteReview = async (reviewId) => {
    console.log(`리뷰 삭제 버튼 클릭: ${reviewId}`);
    const confirmDelete = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    // ✅ Context에서 가져온 값을 기반으로 인증 정보 체크
    if (!isLoggedIn || !currentUserKey || !token) {
      alert('로그인이 필요하거나 인증 정보가 유효하지 않습니다.');
      authCtx.onLogout(); // ✅ Context의 onLogout 사용
      setModalType('login');
      return;
    }

    // ✅ 삭제 시 로딩 상태 업데이트 제거
    // setLoading(true); // 삭제 시 전체 로딩 스피너를 보여줄 경우 사용
    // setError(null); // 삭제 시 오류 메시지 초기화

    try {
        
      // ✅ 리뷰 삭제 API 호출 (DELETE /review/delete/{id})
      // 컨트롤러 명세에 따라 엔드포인트 수정
      const response = await axiosInstance.delete(`${API_BASE_URL}${REVIEW}/delete/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Context에서 가져온 authToken 사용
      });

      // ✅ 백엔드 응답 확인 (CommonResDto 형태 가정)
      if (response.data && response.data.statusCode === 200) {
        alert(response.data.statusMessage || '리뷰가 성공적으로 삭제되었습니다.');
        // 삭제 후 리뷰 목록 다시 로딩 (현재 페이지 유지 또는 1페이지로 이동 등 로직 고려)
        fetchMyReviews(); // ✅ 목록 갱신 호출
      } else if (response.data && response.data.statusCode !== undefined) {
        const backendErrorMessage = response.data.statusMessage || '예상치 못한 백엔드 오류';
        console.error("handleDeleteReview: 리뷰 삭제 실패 - 백엔드 오류:", response.data); // 오류 로그
        alert(backendErrorMessage || '리뷰 삭제에 실패했습니다.');
      } else {
        console.error("handleDeleteReview: 리뷰 삭제 실패 - 예상치 못한 응답:", response.data); // 오류 로그
        alert('리뷰 삭제에 실패했습니다.');
      }

    } catch (err) {
      console.error("handleDeleteReview: 리뷰 삭제 요청 중 오류 발생:", err); // 오류 로그
      if (err.response) {
        const httpStatus = err.response.status;
        const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : `HTTP 오류 (${httpStatus})`;

        if (httpStatus === 401 || httpStatus === 403) {
          alert('로그인이 필요하거나 권한이 없습니다.');
          authCtx.onLogout(); // ✅ Context의 onLogout 사용
          setModalType('login');
        } else if (httpStatus === 404) {
          // 삭제하려는 리뷰가 이미 존재하지 않는 경우
          alert(backendErrorMessage || '삭제하려는 리뷰를 찾을 수 없습니다.');
          fetchMyReviews(); // ✅ 목록 갱신 호출 (404 발생 시)
        }
        else {
          alert(`리뷰 삭제 요청 중 오류가 발생했습니다: ${backendErrorMessage}`);
        }
      } else {
        alert('네트워크 오류로 리뷰 삭제 요청에 실패했습니다.');
      }
    }
    finally {
      // ✅ 삭제 로딩 상태 종료 제거
      // setLoading(false);
      // fetchMyReviews가 호출되었다면, 그 함수의 finally 블록에서 최종 로딩 상태를 false로 만듭니다.
      console.log("handleDeleteReview: API 요청 완료."); // ✅ finally 로그 추가
    }
  };


  return (
    // ✅ 최상위 div에 SCSS 클래스 적용 및 헤더 높이 고려 패딩 (필요시)
    <div className={styles['my-reviews-page-wrapper']}>

      {/* ✅ 페이지 제목 */}
      <h2 className={styles['page-title']}>내가 작성한 리뷰</h2>

      {/* ✅ Context 초기화 상태 및 로그인 상태에 따른 메시지 조건부 렌더링 */}

      {/* Context 초기화 중일 때 로딩 메시지 */}
      {!isInit && <p className={styles['info-message']}>인증 정보를 확인하는 중입니다...</p>}

      {/* Context 초기화 완료 후, 로그인 상태가 아닐 때 메시지 표시 */}
      {isInit && !isLoggedIn && <p className={styles['error-message']}>로그인이 필요한 페이지입니다.</p>}


      {/* Context 초기화 완료 & 로그인 상태일 때의 데이터/오류 상태 */}
      {isInit && isLoggedIn && (
        <> {/* Fragment를 사용하여 여러 엘리먼트를 그룹화 */}
          {/* ✅ 로딩 중 메시지 제거 */}
          {/* {loading && <p className={styles['info-message']}>리뷰를 불러오는 중입니다...</p>} */}

          {/* ✅ 오류가 있을 때 오류 메시지 표시 (로딩 상태는 더 이상 검사 안함) */}
          {error && <p className={styles['error-message']}>{error}</p>}

          {/* ✅ 오류가 없을 때 (데이터 유무에 따라 다르게 표시) (로딩 상태는 더 이상 검사 안함) */}
          {!error && (
            reviewData.length > 0 ? (
              // 데이터가 있을 때 리뷰 목록 표시
              <div className={styles['reviews-list']}> {/* 리뷰 목록을 감싸는 컨테이너 */}
                {reviewData.map(review => (
                  <div key={review.id} className={styles['review-item']}>

                    {/* 썸네일 이미지 */}
                    <div className={styles['item-image-container']}>
                      <img
                        src={review.picUrl || 'placeholder_thumbnail.png'}
                        alt="리뷰 관련 이미지"
                        className={styles['item-image']}
                        onError={(e) => { e.target.src = 'placeholder_thumbnail.png'; }}
                      />
                    </div>

                    {/* 리뷰 상세 정보 */}
                    <div className={styles['item-details']}>

                      {/* 콘텐츠 정보 (예: 제목, 장소, 일시 등 - 추후 contentId로 조회해서 채워야 함) */}
                      <div className={styles['item-place-date']}>
                        {`[콘텐츠 정보 필요] Content ID: ${review.contentId}`}
                      </div>

                      {/* 리뷰 내용 */}
                      <div className={styles['item-content']}>
                        {review.reviewContent || '리뷰 내용 없음'}
                      </div>

                      {/* 작성일 */}
                      <div className={styles['item-date']}>
                        {review.updateDate ? `작성일: ${new Date(review.updateDate).toLocaleDateString()}` : '날짜 정보 없음'}
                      </div>

                      {/* 수정/삭제 버튼 */}
                      <div className={styles['item-actions']}>
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
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 데이터가 0개인 경우 '작성하신 리뷰가 없습니다.' 메시지 표시
              <p className={styles['info-message']}>작성하신 리뷰가 없습니다.</p>
            )
          )}

          {/* ✅ 페이지네이션 또는 더보기 버튼 (오류 없고 데이터 있을 때만 표시) */}
          {!error && reviewData.length > 0 && (
            // TODO: 실제 페이지네이션 UI 렌더링 로직 구현
            <div className={styles['pagination']}>
              {/* ... 페이지네이션 또는 더보기 버튼 내용 ... */}
            </div>
          )}

        </>
      )}


    </div>
  );
};

export default MyReviewsPage;