// src/pages/OrderPage/OrderPage.jsx
import { Button } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, ORDER } from '../../Axios/host-config';
import ModalContext from '../../Modal/ModalContext';
import OrderCouponModal from '../../Modal/order/OrderCouponModal';
import AuthContext from '../../context/UserContext';
import style from './OrderPage.module.scss'; // OrderPage 전용 SCSS 파일

const OrderPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams] = useSearchParams();
  const [humanCount, setHumanCount] = useState(1);
  const { setModalType } = useContext(ModalContext);
  const [userCouponKey, setUserCouponKey] = useState(
    localStorage.getItem('userCoupon')
  );
  const { isLoggedIn } = useContext(AuthContext);

  const [couponInfo, setCouponInfo] = useState(() => {
    const storedDiscount = localStorage.getItem('discount');
    const storedPercent = localStorage.getItem('percent');
    return {
      discount: storedDiscount ? Number(storedDiscount) : null,
      percent: storedPercent ? Number(storedPercent) : null,
    };
  });
  const [modalOpen, setModalOpen] = useState(false);

  const navi = useNavigate();

  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const exhibitionEndDateStr = searchParams.get('endDate');
  const exhibitionEndDate = exhibitionEndDateStr ?
    new Date(exhibitionEndDateStr.replace(/\./g, '-')) :
    null;

  const calcTotalPrice = () => {
    const charge = Number(searchParams.get('charge'));
    const count = Number(humanCount);

    if (isNaN(charge) || isNaN(count) || charge <= 0 || count <= 0) {
      return 0;
    }

    const originTotal = charge * count;
    const { discount, percent } = couponInfo;

    if (discount !== null) { 
      const result = originTotal - discount;
      return result > 0 ? result : 0;
    } else if (percent !== null) { 
      const result = originTotal * (1 - percent / 100);
      return result > 0 ? Math.floor(result) : 0;
    }

    return originTotal;
  };

   useEffect(() => {
    setCouponInfo({ discount: null, percent: null });
    setUserCouponKey(null);
    localStorage.removeItem('userCoupon');
    localStorage.removeItem('discount');
    localStorage.removeItem('percent');
  }, [searchParams.get('id')]); 

  const handleApplyCoupon = ({ discount, percent, userCouponKey }) => {
    setCouponInfo({ discount, percent });
    setUserCouponKey(userCouponKey);

    localStorage.setItem('userCoupon', userCouponKey);
    localStorage.setItem('discount', discount !== null ? discount : ''); // null일 경우 빈 문자열 저장
    localStorage.setItem('percent', percent !== null ? percent : '');     // null일 경우 빈 문자열 저장

    setModalOpen(false);
    alert('쿠폰이 적용되었습니다.');
  };

  const handleCancelCoupon = () => {
    setCouponInfo({ discount: null, percent: null });
    setUserCouponKey(null);
    localStorage.removeItem('userCoupon');
    localStorage.removeItem('discount');
    localStorage.removeItem('percent');
    alert('쿠폰 적용이 취소되었습니다.');
  };

  const couponButtonClickHandler = () => {
    const charge = Number(searchParams.get('charge'));
    const count = Number(humanCount);
    const originalTotalPrice = isNaN(charge) || isNaN(count) || charge <= 0 || count <= 0 ? 0 : charge * count;

    if (originalTotalPrice === 0) {
        alert('무료 전시에는 쿠폰을 적용할 수 없습니다.');
        return;
    }

    setModalOpen(true);
    localStorage.setItem('totalPrice', originalTotalPrice); 
  };

  const orderButtonClickHandler = () => {
    if (!isLoggedIn) {
      alert('로그인 후 진행해주세요!');
      navi('/login'); 
      return;
    }

    if (exhibitionEndDate) {
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const exhibitionEndDateOnly = new Date(exhibitionEndDate.getFullYear(), exhibitionEndDate.getMonth(), exhibitionEndDate.getDate());

      if (selectedDateOnly.getTime() > exhibitionEndDateOnly.getTime()) {
        alert('선택하신 날짜는 전시 기간이 종료되었습니다. 다른 날짜를 선택해주세요.');
        return;
      }
      const today = new Date();
      today.setHours(0,0,0,0); // 오늘 날짜의 자정
      if (selectedDateOnly.getTime() < today.getTime()) {
        alert('선택하신 날짜는 이미 지난 날짜입니다. 다른 날짜를 선택해주세요.');
        return;
      }
    }


    const getData = async () => {
      const body = {
        contentId: searchParams.get('id'),
        userCouponKey: userCouponKey,
        totalPrice: calcTotalPrice(),
      };

      try {
         await axiosInstance
        .post(`${API_BASE_URL}${ORDER}/insert`, body)
        .then((res) => {
          console.log(res.data.result);
        });

        alert(searchParams.get('title') + '이(가) 결제되었습니다.');
        localStorage.removeItem('userCoupon');
        localStorage.removeItem('discount');
        localStorage.removeItem('percent');
                console.log(body);
        navi('/');
      } catch (error) {
        console.error('주문 실패:', error);
        console.log(body);
        
        alert('주문에 실패했습니다. 다시 시도해주세요.');
      }
    };

    getData();
  };

  const handlePrevMonth = () => {
    setActiveStartDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveStartDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCalendarActiveStartDateChange = ({ activeStartDate, view }) => {
    if (view === 'month') {
      setActiveStartDate(activeStartDate);
    }
  };

  return (
    <div className={style['order-page']}>
      <div className={style['order-container']}>
        <div className={style.sidebar}>
          <div className={style['sidebar-section']}>
            <div className={style['section-title']}>개인예매</div>
            <div className={style['exhibition-info']}>
              <div className={style['thumbnail-box']}>
                <img src={searchParams.get('thumbnail')} alt="전시 썸네일" className={style['thumbnail-image']} />
              </div>
              <div className={style['exhibition-details']}>
                ARTLOG
              </div>
              <div className={style['exhibition-sub-details']}>
                {searchParams.get('title')}
              </div>
            </div>
          </div>

          <div className={style['info-section']}>
            <div className={style['info-label']}>장소</div>
            <div className={style['info-value']}>{searchParams.get('venue')}</div>
          </div>

          <div className={style['info-section']}>
            <div className={style['info-label']}>일시</div>
            <div className={style['info-value']}>
              {searchParams.get('startDate') +
                ' ~ ' +
                searchParams.get('endDate')}
            </div>
          </div>

          <div className={style['info-section']}>
            <div className={style['info-label']}>인원</div>
            <div className={style['info-value']}>{humanCount}명</div>
          </div>
        </div>

        <div className={style['main-content']}>
          <div className={style['top-header']}>
            <div className={style['main-title']}>날짜 선택</div>
          </div>

          <div className={style['calendar-section']}>
            <div className={style['calendar-header']}>
              <Button onClick={handlePrevMonth}>{'<'}</Button>
              <div className={style['current-month']}>
                {activeStartDate.getFullYear()}년 {activeStartDate.getMonth() + 1}월
              </div>
              <Button onClick={handleNextMonth}>{'>'}</Button>
            </div>

            <div className={style['calendar-wrapper']}>
              <Calendar
                minDate={new Date()}
                maxDate={exhibitionEndDate}

                calendarType='gregory'
                onChange={(date) => {
                  setSelectedDate(date);
                }}
                value={selectedDate}
                activeStartDate={activeStartDate}
                onActiveStartDateChange={handleCalendarActiveStartDateChange}
                locale='ko-KR'

                tileClassName={({ date, view }) => {
                  const classes = [];
                  if (
                    view === 'month' &&
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString()
                  ) {
                    classes.push(style['selected-date']);
                  }
                  if (exhibitionEndDate) {
                    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    const exhibitionEndDateOnly = new Date(exhibitionEndDate.getFullYear(), exhibitionEndDate.getMonth(), exhibitionEndDate.getDate());
                    if (dateOnly.getTime() > exhibitionEndDateOnly.getTime()) {
                      classes.push(style['after-exhibition-end']);
                    }
                  }
                  return classes.join(' ');
                }}
              />
            </div>
            <div className={style['calendar-legend']}>
              <div><span className={`${style['legend-box']} ${style['legend-available']}`}></span> 예매 가능일</div>
              <div><span className={`${style['legend-box']} ${style['legend-selected']}`}></span> 예매 선택일</div>
            </div>
          </div>

          <div
            className={style['person-select-section']}
            style={searchParams.get('charge') != 0 ? {} : { display: 'none' }}
          >
            <div className={style['section-title']}>인원 선택</div>
            <div className={style['counter-group']}>
              <Button
                onClick={() =>
                  setHumanCount((prev) => (prev === 1 ? prev : prev - 1))
                }
              >
                -
              </Button>
              <div className={style['human-count-display']}>{humanCount}</div>
              <Button onClick={() => setHumanCount((prev) => prev + 1)}>+</Button>
            </div>
          </div>
          <div className={style['coupon-section']}>
            <div className={style['section-title']}>쿠폰</div>
            <div className={style['coupon-status-group']}>
              {userCouponKey && (couponInfo.discount !== null || couponInfo.percent !== null) ? (
                <>
                  <span className={style['applied-coupon-text']}>
                    현재 적용된 쿠폰:
                    {couponInfo.discount ? ` ${couponInfo.discount}원 할인` : ''}
                    {couponInfo.percent ? ` ${couponInfo.percent}% 할인` : ''}
                  </span>
                  <Button
                    onClick={handleCancelCoupon}
                    className={style['coupon-cancel-button']}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <span className={style['no-coupon-text']}>적용된 쿠폰 없음 </span>
              )}
              <Button
                onClick={couponButtonClickHandler}
                className={style['coupon-apply-button']}
                sx={{
                  backgroundColor: '#15202b', 
                  color: '#fff', 
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#0a1016',
                  },
                }}
              >
                쿠폰 적용하기
              </Button>
            </div>
          </div>


          <div className={style['total-price-section']}>
            <div>총 금액</div>
            <div className={style['total-price-value']}>
              {calcTotalPrice().toLocaleString()}원 {/* 금액 포맷팅 */}
              {userCouponKey && (couponInfo.discount || couponInfo.percent) && (
                <span className={style['original-price']}>
                  (할인 전 { (Number(searchParams.get('charge')) * Number(humanCount)).toLocaleString() }원)
                </span>
              )}
            </div>
          </div>

          <div className={style['submit-button-container']}>
            <Button
              className={style['submit-button']}
              onClick={orderButtonClickHandler}
              sx={{
                backgroundColor: '#15202b', // 검정색 배경
                color: '#fff', // 흰색 텍스트
                padding: '15px 30px', // 패딩 조정
                fontSize: '1.2rem', // 폰트 크기
                fontWeight: 'bold', // 폰트 굵게
                borderRadius: '8px', // 둥근 모서리
                width: '100%', // 너비 꽉 채움
                '&:hover': {
                  backgroundColor: '#0a1016', // 호버 시 좀 더 어둡게
                },
              }}
            >
              예매하기
            </Button>
          </div>

          {modalOpen && (
            <OrderCouponModal
              onClose={() => setModalOpen(false)}
              onApply={handleApplyCoupon}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;