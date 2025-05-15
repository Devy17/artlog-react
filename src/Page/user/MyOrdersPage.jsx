// src/pages/MyOrdersPage.jsx

import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, ORDER } from '../../Axios/host-config';
import styles from './MyOrdersPage.module.scss';
import axios from "axios";
import ModalContext from '../../Modal/ModalContext';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('registDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const token = useMemo(() => localStorage.getItem("ACCESS_TOKEN"), []);
  const userKey = useMemo(() => localStorage.getItem("USER_ID"), []);

  const fetchMyOrders = useCallback(async () => {
    if (!token || !userKey) {
      setLoading(false);
      setError('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}${ORDER}/findByAll/${userKey}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.statusCode === 200) {
        setOrderList(Array.isArray(response.data.result) ? response.data.result : []);
        console.log('주문 목록 가져오기 성공:', response.data.statusMessage);
      } else if (response.status === 404) {
        console.log('주문 목록 없음:', response.data?.statusMessage || '');
        setOrderList([]);
      } else {
        const msg = response.data?.statusMessage || '예상치 못한 백엔드 오류';
        const code = response.data?.statusCode || 'N/A';
        setError(`주문 목록 가져오기 실패: ${msg} (상태: ${response.status}, 코드: ${code})`);
        setOrderList([]);
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const msg = data?.statusMessage || '서버 오류';
        const code = data?.statusCode ?? 'N/A';

        if (status === 401 || status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else {
          setError(`주문 목록 가져오기 실패: ${msg} (상태: ${status}, 코드: ${code})`);
        }
      } else {
        setError('네트워크 오류로 주문 목록을 가져올 수 없습니다.');
      }
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  }, [authCtx, navigate, token, userKey, setModalType]);

  useEffect(() => {
    if (!token || !userKey) {
      alert('로그인이 필요한 페이지입니다.');
      authCtx.onLogout();
      setModalType('login');
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }
    fetchMyOrders();
  }, [token, userKey, fetchMyOrders, authCtx, setModalType]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('이 예매를 취소하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        `${API_BASE_URL}${ORDER}/cancel/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.statusCode === 200) {
        alert(response.data.statusMessage || '예매가 정상적으로 취소되었습니다.');
        await fetchMyOrders();
      } else {
        const msg = response.data?.statusMessage || '서버 오류';
        const code = response.data?.statusCode || 'N/A';
        setError(`주문 취소 실패: ${msg} (상태: ${response.status}, 코드: ${code})`);
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const msg = data?.statusMessage || '서버 통신 오류';
        const code = data?.statusCode || 'N/A';

        if (status === 401 || status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else {
          setError(`주문 취소 실패: ${msg} (상태: ${status}, 코드: ${code})`);
        }
      } else {
        setError('네트워크 오류로 주문 취소에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReviewClick = (contentId) => {
    alert(`"${contentId}" 콘텐츠에 대한 리뷰 작성 페이지로 이동 (아직 기능 없음)`);
    console.log(`리뷰 작성 클릭: 콘텐츠 ID ${contentId}`);
  };

  const handleManageReviewClick = (contentId) => {
    alert(`"${contentId}" 콘텐츠에 대한 리뷰 관리 페이지로 이동 (아직 기능 없음)`);
    console.log(`리뷰 관리 클릭: 콘텐츠 ID ${contentId}`);
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orderList;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return orderList.filter(order =>
      order.contentId.toString().toLowerCase().includes(lowerSearchTerm)
    );
  }, [orderList, searchTerm]);

  const filteredAndSortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      let compare = 0;
      if (sortCriterion === 'registDate') {
        compare = new Date(a.registDate) - new Date(b.registDate);
      } else if (sortCriterion === 'totalPrice') {
        compare = a.totalPrice - b.totalPrice;
      }
      return sortDirection === 'asc' ? compare : -compare;
    });
    return sorted;
  }, [filteredOrders, sortCriterion, sortDirection]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSortChange = (e) => {
    const [criterion, direction] = e.target.value.split('_');
    setSortCriterion(criterion);
    setSortDirection(direction);
  };

  return (
    <div className={styles['my-orders-page-wrapper']}>
      <div className={styles['orders-container']}>
        <h2>예매한 콘텐츠</h2>

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
            <select
              value={`${sortCriterion}_${sortDirection}`}
              onChange={handleSortChange}
            >
              <option value='registDate_desc'>예매일: 최근순</option>
              <option value='registDate_asc'>예매일: 오래된순</option>
              <option value='totalPrice_desc'>가격: 높은순</option>
              <option value='totalPrice_asc'>가격: 낮은순</option>
            </select>
          </div>
        </div>

        {loading && <p className={styles['info-message']}>주문 내역 로딩 중...</p>}
        {!loading && error && <p className={styles['error-message']}>{error}</p>}
        {!loading && !error && filteredAndSortedOrders.length === 0 && (
          <p className={styles['info-message']}>
            {orderList.length > 0 && searchTerm
              ? '검색 결과가 없습니다.'
              : '예매한 콘텐츠가 없습니다.'}
          </p>
        )}

        {!loading && !error && filteredAndSortedOrders.length > 0 && (
          <ul className={styles['orders-list']}>
            {filteredAndSortedOrders.map(order => (
              <li key={order.id} className={styles['order-item']}>
                <div className={styles['order-details']}>
                  <p><strong>콘텐츠 ID:</strong> {order.contentId}</p>
                  <p><strong>주문 ID:</strong> {order.id}</p>
                  <p><strong>총 가격:</strong> {order.totalPrice}원</p>
                  <p><strong>예매일:</strong> {new Date(order.registDate).toLocaleDateString('ko-KR')}</p>
                </div>
                <p className={styles['order-status']}>
                  <strong>상태:</strong>{' '}
                  <span className={order.active === 1 ? styles.active : styles.cancelled}>
                    {order.active === 1 ? '예매 완료' : '취소됨'}
                  </span>
                </p>
                <div className={styles['button-group']}>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={order.active !== 1}
                    className={styles['cancel-button']}
                  >
                    주문 취소
                  </button>
                  {order.active === 1 &&
                    (order.isReviewed ? (
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
                    ))}
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
