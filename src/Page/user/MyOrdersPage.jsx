import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import Pagination from "@mui/material/Pagination";
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom'; // createSearchParams import
import AuthContext from '../../context/UserContext';
import { API_BASE_URL, ORDER, API } from '../../Axios/host-config';
import styles from './MyOrdersPage.module.scss';
import ModalContext from '../../Modal/ModalContext';
import axiosInstance from '../../Axios/AxiosBackConfig';


const MyOrdersPage = () => {
  const [apiData, setApiData] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [nextPage, setNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { setModalType } = useContext(ModalContext);

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('registDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const token = localStorage.getItem("ACCESS_TOKEN");
  const userKey = localStorage.getItem("USER_ID");

  console.log(token, userKey);
  

   useEffect(() => {
    const getData = async () => {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${API}/selectByUserKeyPaging?userKey=${userKey}&pageNo=${page}&numOfRows=10`,
      );

      const data = response.data.result;
      console.log(data);

      console.log(data[0].contentThumbnail);
      return data;
    };

    getData().then((response) => {
      setApiData((prev) => [...prev, ...response]);
    });
  } ,[userKey, page]); // page와 userKey가 변경될 때마다 API 호출

 const contentClickHandler = (contentId) => {
  const orderData = orderList.find((item) => item.contentId === contentId);
  const contentData = apiData.find((item) => item.contentId === contentId);

  if (!orderData || !contentData) {
    console.warn("필요한 콘텐츠 정보를 찾을 수 없습니다.");
    return;
  }

  const param = {
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
    search: '?' + createSearchParams(param).toString(),
  });
};



  const fetchMyOrders = useCallback(async () => {
    if (!token || !userKey) {
      setLoading(false);
      setError('사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get( 
        `${API_BASE_URL}${API}/selectByUserKeyPaging?userKey=${userKey}&pageNo=${page}&numOfRows=${rowsPerPage}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
      );
      console.log('📦 주문 응답:', response.data.result);

      if (response.data?.statusCode === 200) {
        setOrderList(Array.isArray(response.data.result) ? response.data.result : []);
        console.log('주문 목록 가져오기 성공:', response.data.statusMessage);

        const result = Array.isArray(response.data.result) ? response.data.result : [];
        setOrderList(result);
        setNextPage(result.length === rowsPerPage);
        if (result.length < rowsPerPage) {
           setTotalPages(page);a
        } else {
          setTotalPages(page + 1);
        }


      } else if (response.status === 404) { // ✅ 백엔드 CommonResDto의 statusCode를 확인하는 것이 더 정확
        console.log('주문 목록 없음:', response.data?.statusMessage || '');
        setOrderList([]);
        setNextPage(false);
      } else {
        const msg = response.data?.statusMessage || '예상치 못한 백엔드 오류';
        const code = response.data?.statusCode || 'N/A';
        // response.status는 HTTP 상태 코드, response.data?.statusCode는 백엔드 비즈니스 코드
        setError(`주문 목록 가져오기 실패: ${msg} (HTTP 상태: ${response.status}, 코드: ${code})`);
        setOrderList([]);
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        const msg = data?.statusMessage || '서버 오류';
        const code = data?.statusCode ?? 'N/A';
        setNextPage(false);

        if (status === 401 || status === 403) {
          alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
          authCtx.onLogout();
          setNextPage(false);
          setModalType('login');
        } else {
          setError(`주문 목록 가져오기 실패: ${msg} (HTTP 상태: ${status}, 코드: ${code})`);
          setNextPage(false);
        }
      } else {
        setError('네트워크 오류로 주문 목록을 가져올 수 없습니다.');
        setNextPage(false);
      }
      setOrderList([]);
    } finally {
      setLoading(false);
      setNextPage(false);
    }
  }, [authCtx, navigate, token, userKey, setModalType, page]); // navigate 의존성은 불필요할 수 있습니다. fetch 함수에서는 사용 안함.

  useEffect(() => {
    if (!token || !userKey) {
      alert('로그인이 필요한 페이지입니다.');
      authCtx.onLogout();
      setModalType('login');
      setLoading(false);
      setOrderList([]);
      setError("로그인이 필요합니다.");
      return;
    }
    fetchMyOrders();
  }, [token, userKey, fetchMyOrders, authCtx, setModalType, page]);


  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('이 예매를 취소하시겠습니까?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete( 
        
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
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orderList;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return orderList.filter(order =>
      // contentId가 number 타입일 경우 toString() 필요
      order.contentId?.toString().toLowerCase().includes(lowerSearchTerm)
    );
  }, [orderList, searchTerm]);

  const filteredAndSortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      let compare = 0;
      if (sortCriterion === 'registDate') {
        // 날짜 객체 비교
        compare = new Date(a.registDate) - new Date(b.registDate);
      } else if (sortCriterion === 'totalPrice') {
        // 숫자 비교
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

        {/* ... (로딩, 오류, 데이터 없음 메시지) ... */}
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
          <>
          <ul className={styles['orders-list']}>
            {filteredAndSortedOrders.map(order => (
              
              <li
                key={order.id}
                className={`${styles['order-item']} ${styles['clickable-order-item']}`} // 클릭 가능 스타일 클래스 추가
                onClick={() => contentClickHandler(order.contentId)} // 클릭 핸들러 연결
              >
                {/* 콘텐츠 썸네일 이미지 */}
                
                <div className={styles['thumbnail-wrapper']}>
                  <img
                    src={order.contentThumbnail || '/default-thumbnail.png'}
                    alt={order.contentTitle || '콘텐츠 썸네일'}
                    className={styles['thumbnail']}
                  />
                </div>
                {/* 주문 상세 정보 */}
                <div className={styles['order-details']}>
                  <p><strong>ID:</strong> {order.contentId}</p>
                  <p><strong>제목:</strong> {order.contentTitle}</p>
                  <p><strong>주문 ID:</strong> {order.id}</p>
                  <p><strong>총 가격:</strong> {order.totalPrice}원</p>
                  <p><strong>예매일:</strong> {new Date(order.registDate).toLocaleDateString('ko-KR')}</p>
                </div>
                {/* 주문 상태 표시 */}
                <p className={styles['order-status']}>
                  <strong>상태:</strong>{' '}
                  <span className={order.active === true ? styles.active : styles.cancelled}>
                    {order.active === true ? '예매 완료' : '취소됨'}
                  </span>
                </p>
                {/* 버튼 그룹 (주문 취소, 리뷰 작성/관리) */}
                <div className={styles['button-group']}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 리스트 항목 클릭 이벤트 버블링 방지
                      handleCancelOrder(order.id);
                    }}
                    disabled={order.active !== true}
                    className={styles['cancel-button']}
                  >
                    주문 취소
                  </button>
                    ))
                </div>
              </li>
            ))}
          </ul>
          <div className={styles['pagination-wrapper']}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              />
              </div>
              </>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
