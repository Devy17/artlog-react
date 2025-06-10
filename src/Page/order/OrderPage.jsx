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
import style from './OrderPage.module.scss';

const OrderPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams] = useSearchParams();
  const [humanCount, setHumanCount] = useState(1);
  const { setModalType } = useContext(ModalContext);
  const [userCouponKey, setUserCouponKey] = useState(
    localStorage.getItem('userCoupon')
  );
  const { isLoggedIn } = useContext(AuthContext);

  const [couponInfo, setCouponInfo] = useState({ discount: null, percent: null });
  const [modalOpen, setModalOpen] = useState(false);

  const navi = useNavigate();

  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 전시 종료일 파싱 (YYYY.MM.DD 형식)
  const exhibitionEndDateStr = searchParams.get('endDate');
  const exhibitionEndDate = exhibitionEndDateStr ?
    new Date(exhibitionEndDateStr.replace(/\./g, '-')) : // "YYYY.MM.DD" -> "YYYY-MM-DD"로 변환 후 파싱
    null;

  // 휴관일 (예시 데이터)
  const holidays = [
    new Date(2025, 5, 8).toDateString(),
    new Date(2025, 5, 22).toDateString(),
    new Date(2025, 5, 29).toDateString(),
  ];
  const isHoliday = (date) => holidays.includes(date.toDateString());


  const calcTotalPrice = () => {
    const charge = Number(searchParams.get('charge'));
    const count = Number(humanCount);

    if (isNaN(charge) || isNaN(count) || charge <= 0 || count <= 0) {
      return 0;
    }

    const originTotal = charge * count;
    const { discount, percent } = couponInfo;

    if (discount) {
      const result = originTotal - discount;
      return result > 0 ? result : 0;
    } else if (percent) {
      const result = originTotal * (1 - percent / 100);
      return result > 0 ? Math.floor(result) : 0;
    }

    return originTotal;
  };

  const handleApplyCoupon = ({ discount, percent, userCouponKey }) => {
    setCouponInfo({ discount, percent });
    setUserCouponKey(userCouponKey);

    localStorage.setItem('userCoupon', userCouponKey);
    if (discount) localStorage.setItem('discount', discount);
    if (percent) localStorage.setItem('percent', percent);

    setModalOpen(false);
    alert('쿠폰이 적용되었습니다.');
    console.log('calcTotalPrice:', calcTotalPrice());
  };

  const couponButtonClickHandler = () => {
    setModalOpen(true);

    const charge = Number(searchParams.get('charge'));
    const count = Number(humanCount);
    const totalPrice = isNaN(charge) || isNaN(count) ? 0 : charge * count;

    localStorage.setItem('totalPrice', totalPrice);
  };

  const orderButtonClickHandler = () => {
    if (!isLoggedIn) {
      alert('로그인 후 진행해주세요!');
      navi('/');
      return;
    }

    // --- 여기부터 날짜 유효성 검사 로직 추가 ---
    if (exhibitionEndDate) {
      // 선택된 날짜의 시간을 자정으로 설정하여 날짜만 비교
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      // 전시 종료일의 시간을 자정으로 설정하여 날짜만 비교
      const exhibitionEndDateOnly = new Date(exhibitionEndDate.getFullYear(), exhibitionEndDate.getMonth(), exhibitionEndDate.getDate());

      // 선택된 날짜가 전시 종료일보다 늦으면 예매 불가
      if (selectedDateOnly.getTime() > exhibitionEndDateOnly.getTime()) {
        alert('선택하신 날짜는 전시 기간이 종료되었습니다. 다른 날짜를 선택해주세요.');
        return; // 예매 진행을 막음
      }
    }
    // --- 날짜 유효성 검사 로직 끝 ---


    const getData = async () => {
      const body = {
        contentId: searchParams.get('id'),
        userCouponKey: userCouponKey,
        totalPrice: calcTotalPrice(),
        // 선택된 날짜 정보도 함께 보낼 수 있습니다 (필요하다면)
        selectedDate: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 전송
      };

      try {
        await axiosInstance.post(`${API_BASE_URL}${ORDER}/insert`, body);
        alert(searchParams.get('title') + '이 결제되었습니다.');
        navi('/');
      } catch (error) {
        console.error('주문 실패:', error);
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
                리움 현대미술 소장품전
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
                // maxDate 설정: 전시 종료일까지만 선택 가능하도록
                maxDate={exhibitionEndDate}
                formatDay={(locale, date) => {
                  const day = date.getDate();
                  const isDateHoliday = isHoliday(date);
                  return (
                    <div className={isDateHoliday ? style['is-holiday'] : ''}>
                      {day}
                      {isDateHoliday && <div className={style['holiday-text']}>휴관</div>}
                    </div>
                  );
                }}
                calendarType='gregory'
                onChange={(date) => {
                  console.log('선택한 날짜:', date);
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
                  if (isHoliday(date)) {
                    classes.push(style['is-holiday']);
                  }
                  // 전시 종료일 이후의 날짜는 비활성화된 것처럼 보이도록 추가
                  if (exhibitionEndDate) {
                    // 날짜만 비교하기 위해 시간 부분을 자정으로 만듦
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

          <div className={style['time-select-section']}>
            <div className={style['section-title']}>시간 선택</div>
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

          <div className={style['total-price-section']}>
            <div>총 금액</div>
            <div className={style['total-price-value']}>{calcTotalPrice()}원</div>
          </div>

          <div className={style['submit-button-container']}>
            <Button className={style['submit-button']} onClick={orderButtonClickHandler}>
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