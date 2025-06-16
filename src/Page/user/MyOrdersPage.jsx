import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, ORDER, API } from '../../Axios/host-config';
import styles from './MyOrdersPage.module.scss';
import ModalContext from '../../Modal/ModalContext';
import axiosInstance from '../../Axios/AxiosBackConfig';

const MyOrdersPage = () => {
  const [displayList, setDisplayList] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [nextPage, setNextPage] = useState(false);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('registDate');
  const [sortDirection, setSortDirection] = useState('asc');

  const token = localStorage.getItem('ACCESS_TOKEN');
  const userKey = localStorage.getItem('USER_ID');

  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  // 마지막이 아닌 첫 번째 아이템 참조용 (새로 추가된 데이터의 마지막 아이템)
  const firstItemRef = useRef(null);

  // 1) 데이터 페치
  const fetchMyOrders = useCallback(async () => {
    if (!token || !userKey) {
      setError('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    if (page === 1) setLoadingInitial(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${API}/selectByUserKeyPaging?userKey=${userKey}&pageNo=${page}&numOfRows=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = Array.isArray(response.data.result) ? response.data.result : [];
      


      // 페이지 1은 교체, 이후 페이지는 위쪽(앞)에 추가
      setDisplayList(prev =>{
        page === 1 ? result : [...prev, ...result]

      console.log('page', page);
      console.log('prev:', prev);
      console.log('result:', result);
      console.log('merged:', page === 1 ? result : [...prev, ...result]);

      const merged = page === 1
      ? result
      : [...prev, ...result];

      console.log('merged:', merged);
      return merged;
      }
      );
      setNextPage(result.length === rowsPerPage);
      
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const msg = data?.statusMessage || '서버 오류';
        if (status === 401 || status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else {
          setError(`주문 목록 가져오기 실패: ${msg} (HTTP ${status})`);
        }
      } else {
        setError('네트워크 오류로 주문 목록을 가져올 수 없습니다.');
      }
      setNextPage(false);
    } finally {
      if (page === 1) setLoadingInitial(false);
      else setLoadingMore(false);
    }
  }, [token, userKey, page, rowsPerPage, authCtx, setModalType]);

  // 2) 초기 로드 & 페이지 변경
  useEffect(() => {
    if (!token || !userKey) {
      alert('로그인이 필요한 페이지입니다.');
      authCtx.onLogout();
      setModalType('login');
      return;
    }
    fetchMyOrders();
  }, [fetchMyOrders, token, userKey, authCtx, setModalType]);

  // 4) 콘텐츠 상세로 이동
  const contentClickHandler = contentId => {
    const contentData = displayList.find(item => item.contentId === contentId);
    if (!contentData) return;
    const params = {
      id: contentId,
      title: contentData.contentTitle,
      venue: contentData.contentVenue,
      charge: contentData.contentCharge,
      period: contentData.contentPeriod,
      thumbnail: contentData.contentThumbnail,
      url: contentData.contentUrl,
      startDate: contentData.startDate,
      endDate: contentData.endDate,
    };
    navigate({
      pathname: '/contentDetail',
      search: '?' + createSearchParams(params).toString(),
    });
  };

  // 5) 주문 취소
  const handleCancelOrder = async orderId => {
    if (!window.confirm('이 예매를 취소하시겠습니까?')) return;
    try {
      const resp = await axiosInstance.delete(
        `${API_BASE_URL}${ORDER}/cancel/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resp.data?.statusCode === 200) {
        alert(resp.data.statusMessage || '예매가 정상적으로 취소되었습니다.');
        setPage(1);
      } else {
        setError(`주문 취소 실패: ${resp.data?.statusMessage || '서버 오류'}`);
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const msg = data?.statusMessage || '서버 통신 오류';
        if (status === 401 || status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setModalType('login');
        } else {
          setError(`주문 취소 실패: ${msg}`);
        }
      } else {
        setError('네트워크 오류로 주문 취소에 실패했습니다.');
      }
    }
  };

  // 6) 검색·정렬
  const filtered = useMemo(() => {
    if (!searchTerm) return displayList;
    const term = searchTerm.toLowerCase();
    return displayList.filter(o =>
      o.contentId?.toString().toLowerCase().includes(term)
    );
  }, [displayList, searchTerm]);

  const filteredAndSorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let diff = 0;
      if (sortCriterion === 'registDate') {
        diff = new Date(a.registDate) - new Date(b.registDate);
      } else {
        diff = a.totalPrice - b.totalPrice;
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
    return arr;
  }, [filtered, sortCriterion, sortDirection]);

  return (
    <div className={styles['my-orders-page-wrapper']}>
      <div className={styles['orders-container']}>
        <h2>예매한 콘텐츠</h2>

        {page === 1 && loadingInitial && (
          <p className={styles['info-message']}>주문 내역 로딩 중...</p>
        )}
        {error && !loadingInitial && !loadingMore && (
          <p className={styles['error-message']}>{error}</p>
        )}

        {filteredAndSorted.length > 0 ? (
          <>
            <ul className={styles['orders-list']}>
              {filteredAndSorted.map((order, idx) => {
                const isFirstNew = page > 1 && idx < rowsPerPage;
                return (
                  <li
                    key={order.id}
                    ref={isFirstNew ? firstItemRef : null}
                    className={`${styles['order-item']} ${styles['clickable-order-item']}`}
                    onClick={() => contentClickHandler(order.contentId)}
                  >
                    <div className={styles['thumbnail-wrapper']}>
                      <img
                        loading="lazy"
                        src={order.contentThumbnail || '/default-thumbnail.png'}
                        alt={order.contentTitle || '썸네일'}
                        className={styles['thumbnail']}
                      />
                    </div>
                    <div className={styles['order-details']}>
                      <p><strong>ID:</strong> {order.contentId}</p>
                      <p><strong>제목:</strong> {order.contentTitle}</p>
                      <p><strong>주문 ID:</strong> {order.id}</p>
                      <p><strong>총 가격:</strong> {order.totalPrice}원</p>
                      <p>
                        <strong>예매일:</strong>{' '}
                        {new Date(order.registDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <p className={styles['order-status']}>
                      <strong>상태:</strong>{' '}
                      <span className={order.active ? styles.active : styles.cancelled}>
                        {order.active ? '예매 완료' : '취소됨'}
                      </span>
                    </p>
                    <div className={styles['button-group']}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCancelOrder(order.id);
                        }}
                        disabled={!order.active}
                        className={styles['cancel-button']}
                      >
                        주문 취소
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {loadingMore && (
              <p className={styles['info-message']}>더 불러오는 중...</p>
            )}

            {nextPage && !loadingMore && (
              <div className={styles['load-more-wrapper']}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  className={styles['load-more-button']}
                >
                  더보기
                </button>
              </div>
            )}
          </>
        ) : (
          page === 1 && !loadingInitial && !error && (
            <p className={styles['info-message']}>
              {searchTerm ? '검색 결과가 없습니다.' : '예매한 콘텐츠가 없습니다.'}
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;