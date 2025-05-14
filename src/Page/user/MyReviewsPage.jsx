// src/pages/MyReviewsPage.jsx

import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig'; // 백엔드 API 인스턴스
import { API_BASE_URL, REVIEW } from '../../Axios/host-config'; // API 엔드포인트 상수
import AuthContext from '../../context/UserContext'; // ✅ 인증 컨텍스트 (userKey 가져오기 위함)
import styles from './MyReviewsPage.module.scss'; // ✅ 스타일 SCSS 모듈

// TODO: 필요하다면 개별 리뷰 항목 컴포넌트를 분리하여 재사용성 높이기
// import MyReviewItem from '../../Component/content/MyReviewItem';

const MyReviewsPage = () => {

    const currentUserKey = localStorage.getItem("USER_ID"); // 임시 사용자 ID
    // ✅ 임시 토큰 가져오기 (실제 앱에서는 AuthContext 또는 안전한 곳에서 가져옴)
    // TODO: 실제 앱에서는 AuthContext의 token 또는 다른 안전한 곳에서 가져와야 합니다.
    const authToken = localStorage.getItem("ACCESS_TOKEN"); // 임시 토큰


    const [reviewData, setReviewData] = useState([]);
    const [loading, setLoading] = useState(true); // 초기 로딩 상태는 true
    const [error, setError] = useState(null); // 오류 상태

    // ✅ 페이지네이션 관련 상태
    const [currentPage, setCurrentPage] = useState(1);
    // TODO: 백엔드 응답에서 실제 총 페이지 수를 받아오도록 수정
    const [totalPages, setTotalPages] = useState(1); // 초기값은 1
    // TODO: 백엔드 API가 페이지당 항목 수를 파라미터로 받는다면 활용
    const itemsPerPage = 5; // 페이지당 보여줄 리뷰 수 (백엔드 API 명세 확인)


    // ✅ fetchMyReviews 함수를 컴포넌트 함수의 메인 스코프에 정의합니다.
    // 이렇게 해야 useEffect 내부와 handleDeleteReview 내부 모두에서 호출 가능합니다.
    const fetchMyReviews = async () => {
        // userKey 또는 토큰이 없으면 로그인되지 않았거나 문제가 있는 상태
        if (!currentUserKey || !authToken) { // 토큰 체크도 추가
            setReviewData([]);
            setLoading(false);
            setError('사용자 정보를 찾을 수 없거나 로그인이 필요합니다.'); // 메시지 수정
            // TODO: 로그인 페이지로 리다이렉트 등 처리 (e.g., navigate('/login'))
            return;
        }

        setLoading(true); // ✅ 로딩 시작
        setError(null); // ✅ 오류 초기화

        try {
            // ✅ REV_04 사용자 별 리뷰 조회 API 호출
            // TODO: 백엔드 API가 페이지네이션 파라미터 (page, size)를 지원한다면 여기에 params 추가
            const response = await axiosInstance.get(
                `${API_BASE_URL}${REVIEW}/findByUserKey/${currentUserKey}`,
                {
                    headers: { Authorization: `Bearer ${authToken}` }, // ✅ 토큰 헤더에 포함
                    // 예시: 페이지네이션 파라미터
                    // params: {
                    //     page: currentPage - 1, // 백엔드가 0부터 시작하는 페이지 번호를 기대한다면
                    //     size: itemsPerPage,
                    // },
                }
            );

            // ✅ 응답 데이터 처리 (CommonResDto 형태 예상)
            // TODO: 실제 백엔드 응답 구조 (CommonResDto 등으로 감싸져 있는지, 페이지네이션 정보 위치 등)에 맞게 수정
            if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.result)) {
                const data = response.data.result;
                setReviewData(data); // 리뷰 목록 데이터 설정

                // TODO: 백엔드 응답에 총 페이지 수 정보가 있다면 setTotalPages(response.data.totalPages) 등으로 설정
                // 예시: const totalReviews = response.data.totalElements; // totalElements 등 필드명 확인
                // 예시: setTotalPages(Math.ceil(totalReviews / itemsPerPage));

            } else if (response.data && response.data.statusCode === 404) {
                // 요구사항 명세의 404 오류 처리 (리뷰가 없는 경우)
                console.log("해당 사용자가 작성한 리뷰가 없습니다. (404 응답)");
                setReviewData([]); // 리뷰 목록 비움
                setError(null); // 404는 오류로 표시하지 않음 (데이터 없음 상태)
                // setTotalPages(1); // 총 페이지 수도 1로 설정
            }
            else if (response.data && response.data.statusCode !== undefined) {
                // 백엔드가 2xx 응답을 보냈으나 비즈니스 로직 오류 (예: 200 OK인데 statusMessage로 오류 전달)
                console.error("리뷰 로딩 실패 - 백엔드 오류 응답:", response.data);
                setError(response.data.statusMessage || '리뷰를 불러오는데 실패했습니다.');
                setReviewData([]); // 오류 발생 시 목록 비움
                // setTotalPages(1);
            }
            else {
                // 예상치 못한 응답 형식 (예: CommonResDto 구조가 아님)
                console.error("리뷰 로딩 실패 - 예상치 못한 응답 형식:", response.data);
                setError('리뷰 데이터를 가져오는데 실패했습니다.');
                setReviewData([]); // 오류 발생 시 목록 비움
                // setTotalPages(1);
            }


        } catch (err) {
            // ✅ API 호출 중 발생한 예외 처리 (네트워크 오류, 4xx/5xx HTTP 상태 코드 등)
            console.error("Error fetching my reviews:", err);
            if (err.response) {
                const httpStatus = err.response.status;
                console.error("리뷰 로딩 실패 - HTTP 응답 상세:", httpStatus, err.response.data);
                // 백엔드 오류 메시지가 있다면 사용, 없다면 상태 코드로 일반 메시지
                const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : `HTTP 오류 (${httpStatus})`;

                if (httpStatus === 401 || httpStatus === 403) {
                    setError('로그인이 필요하거나 권한이 없습니다.');
                    // TODO: 실제 앱에서는 로그아웃 처리 및 로그인 페이지 리다이렉트
                } else if (httpStatus === 404) {
                    // 요구사항 명세에 404가 리뷰 없음으로 정의되어 있으므로 여기서 별도 처리
                    console.log("해당 사용자가 작성한 리뷰가 없습니다. (404 응답)");
                    setReviewData([]); // 리뷰 목록 비움
                    setError(null); // 404는 오류로 표시하지 않음 (데이터 없음 상태)
                    // setTotalPages(1);
                }
                else {
                    setError(`리뷰 로딩 실패: ${backendErrorMessage}`);
                }
            } else {
                // 응답 자체가 없는 네트워크 오류 등
                setError('네트워크 오류로 리뷰를 가져올 수 없습니다.');
            }
            setReviewData([]); // 오류 발생 시 목록 비움
            // setTotalPages(1);

        } finally {
            setLoading(false); // 로딩 종료 (성공/실패/데이터 없음 모두)
        }
    };

    // ✅ 리뷰 데이터 로딩 useEffect 수정 (fetchMyReviews 함수를 호출만 합니다)
    useEffect(() => {
        // userKey와 토큰이 모두 있을 때만 데이터 로딩 시작
        if (currentUserKey && authToken) { // 토큰 체크도 추가
            fetchMyReviews(); // ✅ 메인 스코프에 정의된 fetchMyReviews 호출
        } else {
            // userKey 또는 토큰이 없을 경우 초기 로딩 상태 처리
            setLoading(false);
            setReviewData([]);
            setError('사용자 정보를 찾을 수 없거나 로그인이 필요합니다.');
        }

        // useEffect 클린업 함수 (필요시)
        // return () => { /* 컴포넌트 언마운트 시 로딩 취소 로직 등 */ };
    }, [currentUserKey, authToken, currentPage]); // ✅ userKey, 토큰, 페이지 번호 변경 시 다시 로딩

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

        // 삭제 API 호출 시 토큰 필요
        const token = localStorage.getItem("ACCESS_TOKEN"); // TODO: AuthContext에서 가져오도록 수정
        if (!token) {
            alert('로그인이 필요합니다.');
            // TODO: 로그인 페이지 리다이렉트
            return;
        }

        try {
            // ✅ 리뷰 삭제 API 호출 (DELETE /review/delete/{id})
            // 컨트롤러 명세에 따라 엔드포인트 수정
            const response = await axiosInstance.delete(`${API_BASE_URL}${REVIEW}/delete/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ 백엔드 응답 확인 (CommonResDto 형태 가정)
            if (response.data && response.data.statusCode === 200) {
                alert(response.data.statusMessage || '리뷰가 성공적으로 삭제되었습니다.');
                // 삭제 후 리뷰 목록 다시 로딩 (현재 페이지 유지 또는 1페이지로 이동 등 로직 고려)
                // TODO: 백엔드 페이지네이션 지원 시 이 로직 개선 필요
                // fetchMyReviews 함수를 호출하여 목록 갱신합니다.
                fetchMyReviews();


            } else if (response.data && response.data.statusCode !== undefined) {
                console.error("리뷰 삭제 실패 - 백엔드 오류:", response.data);
                alert(response.data.statusMessage || '리뷰 삭제에 실패했습니다.');
            } else {
                console.error("리뷰 삭제 실패 - 예상치 못한 응답:", response.data);
                alert('리뷰 삭제에 실패했습니다.');
            }

        } catch (err) {
            console.error("리뷰 삭제 요청 중 오류 발생:", err);
            if (err.response) {
                const httpStatus = err.response.status;
                const backendErrorMessage = err.response.data && err.response.data.statusMessage ? err.response.data.statusMessage : `HTTP 오류 (${httpStatus})`;

                if (httpStatus === 401 || httpStatus === 403) {
                    alert('로그인이 필요하거나 권한이 없습니다.');
                    // TODO: 로그아웃 처리 및 로그인 페이지 리다이렉트
                } else if (httpStatus === 404) {
                    // 삭제하려는 리뷰가 이미 존재하지 않는 경우
                    alert(backendErrorMessage || '삭제하려는 리뷰를 찾을 수 없습니다.');
                    // 목록 갱신을 위해 다시 불러오기
                    fetchMyReviews();
                }
                else {
                    alert(`리뷰 삭제 요청 중 오류가 발생했습니다: ${backendErrorMessage}`);
                }
            } else {
                alert('네트워크 오류로 리뷰 삭제 요청에 실패했습니다.');
            }
        }
        
    };


    return (
        <div className={styles['my-reviews-page-wrapper']}>
            <h2 className={styles['page-title']}>내가 작성한 리뷰</h2>

            {loading && <p className={styles['info-message']}>리뷰를 불러오는 중입니다...</p>}
            {error && <p className={styles['error-message']}>{error}</p>}
            {!loading && !error && reviewData.length === 0 && <p className={styles['info-message']}>작성하신 리뷰가 없습니다.</p>}

            {!loading && !error && reviewData.length > 0 && (
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
            )}

        
            {!loading && !error && reviewData.length > 0 && (
                // TODO: 실제 페이지네이션 UI 렌더링 로직 구현
                // <div className={styles['pagination']}>
                //     <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
                //     {/* 페이지 번호 맵핑 */}
                //     {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                //          <span
                //               key={pageNumber}
                //               className={pageNumber === currentPage ? styles['active-page'] : styles['page-number']}
                //               onClick={() => handlePageChange(pageNumber)}
                //          >
                //               {pageNumber}
                //          </span>
                //     ))}
                //     <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
                // </div>

                // ✅ 더보기 버튼 (만약 백엔드가 페이지네이션 없이 전체를 주거나, 더보기 패턴이라면)
                // TODO: 백엔드가 페이지네이션을 지원하지 않고 전체 목록을 준다면 이 버튼은 필요 없습니다.
                // TODO: 백엔드가 '더보기' 패턴을 지원한다면 handlePageChange 로직을 '더보기' 로직으로 수정해야 합니다.
                <div className={styles['pagination']}>
                    {/* 현재 코드 구조상 currentPage, totalPages는 의미 없을 수 있습니다. */}
                    {/* 더보기 버튼을 사용한다면, ContentViewPage 컴포넌트처럼 page 상태를 증가시키는 로직 필요 */}
                    {/* <button onClick={() => setPage(prev => prev + 1)}>더보기</button> */}
                    {/* 여기서는 일단 기본 페이지네이션 UI의 플레이스홀더로 남겨둡니다. */}
                </div>
            )}


        </div> 
    );
};

export default MyReviewsPage;