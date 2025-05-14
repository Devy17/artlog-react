// src/pages/MyOrdersPage.jsx

import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, ORDER } from '../../Axios/host-config';
import styles from './MyOrdersPage.module.scss';
import axios from "axios";

const MyOrdersPage = () => {
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    const [orderList, setOrderList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 검색/정렬 관련 상태 추가
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriterion, setSortCriterion] = useState('registDate'); // ✅ 정렬 기준 (기본: 예매일)
    const [sortDirection, setSortDirection] = useState('desc'); // ✅ 정렬 방향 (기본: 내림차순)


    // 현재 로그인한 사용자 ID (주문 조회에 사용)
    const loggedInUserId = localStorage.getItem("USER_ID");

    // ✅ 사용자별 주문 목록 가져오기 함수
    const fetchMyOrders = useCallback(async () => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const userKey = localStorage.getItem("USER_ID");

        if (!token || !userKey) {
            setLoading(false);
            setError("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}${ORDER}/order/findByAll/${userKey}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && response.data.statusCode === 200) {
                const orders = Array.isArray(response.data.result) ? response.data.result : [];
                setOrderList(orders);
                setError(null);

                if (response.data.statusMessage) {
                    console.log("주문 목록 가져오기 성공:", response.data.statusMessage);
                }
               
            }
            else {
                const backendStatusCode = response.data ? response.data.statusCode : 'N/A';
                const backendStatusMessage = (response.data && response.data.statusMessage) ? response.data.statusMessage : '예상치 못한 백엔드 오류';
                const httpStatus = response.status;
                if (httpStatus === 404) {
                    console.log("주문 목록 가져오기 (404 - 주문 없음):", response.data.statusMessage || "주문한 콘텐츠가 없습니다.");
                    setOrderList([]);
                    setError(null);
                }
             
                console.error("주문 목록 가져오기 실패 - 백엔드 오류 응답:", httpStatus, backendStatusCode, backendStatusMessage, response.data);
                setError(`주문 목록 가져오기 실패: ${backendStatusMessage} (상태: ${httpStatus}, 코드: ${backendStatusCode})`);
                setOrderList([]);
            }

        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response) {
                const httpStatus = err.response.status;
                console.error("주문 목록 가져오기 실패 - 백엔드 오류 응답:", httpStatus, backendStatusCode, backendStatusMessage, response.data);

                console.error("주문 목록 가져오기 실패 - HTTP 응답 상세:", httpStatus, err.response.data);
                const backendErrorMessage = (err.response.data && err.response.data.statusMessage) ? err.response.data.statusMessage : '서버 통신 오류';
                const backendStatusCodeInBody = (err.response.data && err.response.data.statusCode !== undefined) ? err.response.data.statusCode : 'N/A';


                if (httpStatus === 401 || httpStatus === 403) {
                    alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                    authCtx.onLogout();
                    navigate('/login');
                }
                else {
                    setError(`주문 목록 가져오기 실패: ${backendErrorMessage} (상태: ${httpStatus}, 코드: ${backendStatusCodeInBody})`);
                    console.error("주문 목록 가져오기 실패 - 백엔드 오류 응답:", httpStatus, backendStatusCode, backendStatusMessage, response.data);

                }
            } else {
                setError('네트워크 오류로 주문 목록을 가져올 수 없습니다.');
            }
            setOrderList([]);
        } finally {
            setLoading(false);
        }
    }, [authCtx, navigate]);


    useEffect(() => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const userKey = localStorage.getItem("USER_ID");

        if (!token || !userKey) {
            console.log("MyOrdersPage Mount: Authentication info missing. Redirecting.");
            setLoading(false);
            setError("로그인이 필요합니다.");
            alert('로그인이 필요한 페이지입니다.');
            authCtx.onLogout();
            navigate('/login');
            return;
        }

        fetchMyOrders();

    }, [authCtx, navigate, fetchMyOrders]);


    // ✅ 핸들러: 주문 취소 (기존 코드 유지)
    const handleCancelOrder = async (orderId) => {
       // ... handleCancelOrder 내용 ...
        if (!window.confirm('이 예매를 취소하시겠습니까?')) {
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem("ACCESS_TOKEN");
        const userKey = localStorage.getItem("USER_ID");
         if (!token || !userKey) {
              setError("사용자 인증 정보가 없습니다. 다시 로그인해주세요.");
              alert('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
              authCtx.onLogout();
              navigate('/login');
              setLoading(false);
              return;
         }

        try {
            const response = await axios.delete(`${API_BASE_URL}${ORDER}/cancel/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data && response.data.statusCode === 200) {
                alert(response.data.statusMessage || '예매가 정상적으로 취소되었습니다.');
                await fetchMyOrders();

            } else if (response.data && response.data.statusCode !== undefined) {
                const backendStatusCode = response.data.statusCode;
                const backendStatusMessage = (response.data && response.data.statusMessage) ? response.data.statusMessage : '예상치 못한 백엔드 오류';
                const httpStatus = response.status;
                console.error("주문 취소 실패 - 백엔드 오류 응답:", httpStatus, backendStatusCode, backendStatusMessage, response.data);
                setError(`주문 취소 실패: ${backendStatusMessage} (상태: ${httpStatus}, 코드: ${backendStatusCode})`);

            } else {
                const httpStatus = response.status;
                console.error("주문 취소 실패 - 예상치 못한 2xx 응답 형식:", httpStatus, response.data);
                setError(`주문 취소 실패: 예상치 못한 서버 응답 형식 (상태: ${httpStatus})`);
            }


        } catch (err) {
            console.error("Error cancelling order:", err);
            if (err.response) {
                const httpStatus = err.response.status;
                console.error("주문 취소 실패 - HTTP 응답 상세:", httpStatus, err.response.data);
                const backendErrorMessage = (err.response.data && err.response.data.statusMessage) ? err.response.data.statusMessage : '서버 통신 오류';
                const backendStatusCodeInBody = (err.response.data && err.response.data.statusCode !== undefined) ? err.response.data.statusCode : 'N/A';

                if (httpStatus === 401 || httpStatus === 403) {
                    alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                    authCtx.onLogout();
                    navigate('/login');
                } else {
                    setError(`주문 취소 실패: ${backendErrorMessage} (상태: ${httpStatus}, 코드: ${backendStatusCodeInBody})`);
                }
            } else {
                setError('네트워크 오류로 주문 취소에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };


    // ✅ 핸들러: 리뷰 작성 버튼 클릭 (임시) (기존 코드 유지)
    const handleWriteReviewClick = (contentId) => {
       // ... handleWriteReviewClick 내용 ...
        alert(`"${contentId}" 콘텐츠에 대한 리뷰 작성 페이지로 이동 (아직 기능 없음)`);
        console.log(`리뷰 작성 클릭: 콘텐츠 ID ${contentId}`);
    };

    // ✅ 핸들러: 리뷰 수정/삭제 버튼 클릭 (임시) (기존 코드 유지)
    const handleManageReviewClick = (contentId) => {
       // ... handleManageReviewClick 내용 ...
       alert(`"${contentId}" 콘텐츠에 대한 리뷰 관리 페이지로 이동 (아직 기능 없음)`);
       console.log(`리뷰 관리 클릭: 콘텐츠 ID ${contentId}`);
    };


    // ✅ 검색 필터링 로직 (useMemo) (기존 코드 유지)
    const filteredOrders = useMemo(() => {
        if (!searchTerm) {
            return orderList;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return orderList.filter(order =>
            order.contentId.toString().toLowerCase().includes(lowerSearchTerm)
        );
    }, [orderList, searchTerm]);


    // ✅ 정렬 로직 (useMemo) - totalPrice 정렬 로직 추가
    const filteredAndSortedOrders = useMemo(() => {
        const sortableOrders = [...filteredOrders];

        sortableOrders.sort((a, b) => {
            let comparison = 0;

            // 정렬 기준에 따라 비교 로직 선택
            if (sortCriterion === 'registDate') {
                const dateA = new Date(a.registDate).getTime();
                const dateB = new Date(b.registDate).getTime();
                if (dateA > dateB) comparison = 1;
                else if (dateA < dateB) comparison = -1;
            }
            else if (sortCriterion === 'totalPrice') { // ✅ 가격 정렬 로직 추가
                if (a.totalPrice > b.totalPrice) comparison = 1;
                else if (a.totalPrice < b.totalPrice) comparison = -1;
            }
            // TODO: 다른 정렬 기준 추가 시 여기에 비교 로직 구현

            // 정렬 방향 적용
            return sortDirection === 'asc' ? comparison : comparison * -1;
        });

        return sortableOrders;
    }, [filteredOrders, sortCriterion, sortDirection]);


    // ✅ 검색어 입력 핸들러 (기존 코드 유지)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // ✅ 정렬 변경 핸들러 (SELECT 변경 시) - 핸들러 로직 수정
    const handleSortChange = (event) => {
        const selectedValue = event.target.value; // 예: "registDate_desc" 또는 "totalPrice_asc"
        const [criterion, direction] = selectedValue.split('_'); // "_" 기준으로 분리

        setSortCriterion(criterion); // 정렬 기준 업데이트
        setSortDirection(direction); // 정렬 방향 업데이트
    };


    // --- JSX: 페이지 UI 렌더링 ---
    return (
        <div className={styles['my-orders-page-wrapper']}>
            <div className={styles['orders-container']}>
                <h2>예매한 콘텐츠</h2>

                {/* ✅ 검색 및 정렬 UI */}
                <div className={styles['filter-sort-container']}>
                    <div className={styles['search-box']}>
                        <input
                            type="text"
                            placeholder="콘텐츠 검색 (ID 기준)"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className={styles['sort-box']}>
                         {/* ✅ 정렬 SELECT 박스 */}
                         <select
                             // ✅ select value를 sortCriterion과 sortDirection 조합으로 바인딩
                             value={`${sortCriterion}_${sortDirection}`}
                             onChange={handleSortChange} // 변경 시 핸들러 호출
                         >
                             {/* ✅ 옵션 값과 라벨 명확하게 변경 */}
                             <option value="registDate_desc">예매일: 먼 훗날 순</option>
                             <option value="registDate_asc">예매일: 가까운 순</option>
                             <option value="totalPrice_desc">가격: 높은순</option>
                             <option value="totalPrice_asc">가격: 낮은순</option>
                             {/* TODO: 다른 정렬 기준 옵션 추가 시 value와 label 정의 */}
                         </select>
                    </div>
                </div>


                {/* ✅ 상태별 메시지 및 목록 표시 - 각 상태에 대해 별도 조건 사용 */}

                {/* 로딩 중 메시지 */}
                {loading && <p className={styles['info-message']}>주문 내역 로딩 중...</p>}

                {/* 일반적인 API 오류 메시지 */}
                {!loading && error && <p className={styles['error-message']}>{error}</p>}

                {/* 로딩 끝나고, 오류 없고, 보여질 목록 (검색/정렬 후)이 비어 있을 때 */}
                {!loading && !error && filteredAndSortedOrders.length === 0 && (
                    <p className={styles['info-message']}>
                        {orderList.length > 0 && searchTerm && filteredAndSortedOrders.length === 0
                            ? "검색 결과가 없습니다."
                            : "예매한 콘텐츠가 없습니다."
                        }
                    </p>
                )}

                {/* 로딩 끝나고, 오류 없고, 보여줄 목록이 있을 때 */}
                {!loading && !error && filteredAndSortedOrders.length > 0 && (
                    <ul className={styles['orders-list']}>
                        {/* ✅ filterAndSortedOrders를 매핑 */}
                        {filteredAndSortedOrders.map(order => (
                            <li key={order.id} className={styles['order-item']}>
                                {/* 주문 상세 정보를 감싸는 div 추가 */}
                                <div className={styles['order-details']}>
                                    {/* TODO: contentId를 사용하여 콘텐츠 상세 정보를 가져와 표시해야 함 */}
                                    {/* 현재는 contentId 값만 표시 */}
                                    <p><strong>콘텐츠 ID:</strong> {order.contentId}</p>
                                    {/* TODO: 콘텐츠 이름, 장소, 일시 등을 표시하기 위한 새로운 구조 추가 및 스타일링 필요 */}

                                    <p><strong>주문 ID:</strong> {order.id}</p>
                                    <p><strong>총 가격:</strong> {order.totalPrice}원</p>
                                    <p><strong>예매일:</strong> {order.registDate ? new Date(order.registDate).toLocaleDateString() : '날짜 정보 없음'}</p>
                                </div>

                                {/* 주문 상태 표시 */}
                                <p className={styles['order-status']}>
                                    <strong>상태:</strong>
                                    <span className={order.active === 1 ? styles.active : styles.cancelled}>
                                        {order.active === 1 ? '예매 완료' : '취소됨'}
                                    </span>
                                </p>

                                <div className={styles['button-group']}>
                                    {/* 주문 취소 버튼 */}
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={order.active !== 1} // active가 1일 때만 활성화
                                        className={styles['cancel-button']}
                                    >
                                        주문 취소
                                    </button>

                                    {/* 리뷰 관련 버튼 */}
                                    {order.active === 1 && ( // active가 1인 경우에만 리뷰 버튼 표시
                                        order.isReviewed ? (
                                            <button
                                                onClick={() => handleManageReviewClick(order.contentId)}
                                                className={styles['manage-review-button']}
                                            >
                                                리뷰 관리
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleWriteReviewClick(order.contentId)}
                                                className={styles['write-review-button']}
                                            >
                                                리뷰 작성
                                            </button>
                                        )
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

            </div>
        </div>
    );
};

export default MyOrdersPage;