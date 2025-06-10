import { Button } from '@mui/material';
import React, { useContext, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // react-calendar 기본 스타일은 유지하고 SCSS로 오버라이드
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, ORDER } from '../../Axios/host-config';
import ModalContext from '../../Modal/ModalContext';
import OrderCouponModal from '../../Modal/order/OrderCouponModal';
import AuthContext from '../../context/UserContext';
import style from './OrderPage.module.scss'; // SCSS 모듈 임포트

const OrderPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams] = useSearchParams();
  const [humanCount, setHumanCount] = useState(1);
  const { setModalType } = useContext(ModalContext);
  const [userCouponKey, setUserCouponKey] = useState(
    localStorage.getItem('userCoupon')
  );
  const { isLoggedIn } = useContext(AuthContext);

  // 쿠폰 정보 상태 추가
  const [couponInfo, setCouponInfo] = useState({ discount: null, percent: null });
  const [modalOpen, setModalOpen] = useState(false);

  const navi = useNavigate();

  // 캘린더 뷰의 현재 활성 시작 날짜를 제어하기 위한 상태
  // 이 상태가 변경되면 캘린더의 월도 함께 변경됩니다.
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  // 휴관일 (예시 데이터, 실제로는 API로 받아올 수 있습니다)
  const holidays = [
    new Date(2025, 5, 8).toDateString(), // 2025년 6월 8일 (일요일)
    new Date(2025, 5, 22).toDateString(), // 2025년 6월 22일 (일요일)
    new Date(2025, 5, 29).toDateString(), // 2025년 6월 29일 (일요일)
  ];
  const isHoliday = (date) => holidays.includes(date.toDateString());


  const calcTotalPrice = () => {
    const charge = Number(searchParams.get('charge'));
    const count = Number(humanCount);

    // 둘 중 하나라도 NaN이거나 0 이하면 0 반환
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

    const getData = async () => {
      const body = {
        contentId: searchParams.get('id'),
        userCouponKey: userCouponKey,
        totalPrice: calcTotalPrice(),
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

  // '이전 달' 버튼 클릭 핸들러
  const handlePrevMonth = () => {
    setActiveStartDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // '다음 달' 버튼 클릭 핸들러
  const handleNextMonth = () => {
    setActiveStartDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar 컴포넌트의 onActiveStartDateChange 핸들러
  // 캘린더 내부에서 월이 변경될 때 displayMonth 상태를 업데이트합니다.
  const handleCalendarActiveStartDateChange = ({ activeStartDate, view }) => {
    if (view === 'month') {
      setActiveStartDate(activeStartDate);
    }
  };

  return (
    <div className={style['order-page']}>
      <div className={style['order-container']}>
        {/* 사이드바 */}
        <div className={style.sidebar}>
          <div className={style['sidebar-section']}>
            <div className={style['section-title']}>개인예매</div>
            <div className={style['exhibition-info']}>
              <div className={style['thumbnail-box']}>
                {/* 썸네일 object-fit: contain 적용 */}
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

        {/* 메인 콘텐츠 */}
        <div className={style['main-content']}>
          {/* 상단 헤더 */}
          <div className={style['top-header']}>
            <div className={style['main-title']}>날짜 선택</div>
            {/* '이달/다음달' 버튼은 리움 이미지에 있는 네비게이션 버튼과 독립적으로 보임,
                캘린더 헤더에서 월 이동 버튼을 직접 제어할 것이므로 여기서는 제거하거나 용도 변경 필요
                현재 리움과 유사한 UI를 위해 캘린더 자체 네비게이션으로 대체. */}
            {/* <div className={style['top-buttons']}>
              <Button className={style.active}>이달</Button>
              <Button>다음달</Button>
            </div> */}
          </div>

          {/* 캘린더 섹션 */}
          <div className={style['calendar-section']}>
            {/* 캘린더 헤더와 버튼들 */}
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
                formatDay={(locale, date) => {
                  const day = date.getDate();
                  const isDateHoliday = isHoliday(date);
                  // 휴관일이면서 비활성화된 날짜는 '휴관' 텍스트를 표시하지 않음
                  // Calendar 컴포넌트의 disableDates 설정에 따라 실제 동작은 달라질 수 있음
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
                value={selectedDate} // 선택된 날짜
                activeStartDate={activeStartDate} // 캘린더가 보여줄 시작 날짜
                onActiveStartDateChange={handleCalendarActiveStartDateChange} // 캘린더 내부에서 월 변경 시
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
                    classes.push(style['is-holiday']); // 휴관일 클래스 추가
                  }
                  return classes.join(' ');
                }}
              />
            </div>
            {/* 캘린더 범례 */}
            <div className={style['calendar-legend']}>
              <div><span className={`${style['legend-box']} ${style['legend-available']}`}></span> 예매 가능일</div>
              <div><span className={`${style['legend-box']} ${style['legend-selected']}`}></span> 예매 선택일</div>
            </div>
          </div>

          {/* 시간 선택 섹션 (이미지에는 없지만, 나중에 추가될 수 있으므로 구조만) */}
          <div className={style['time-select-section']}>
            <div className={style['section-title']}>시간 선택</div>
            {/* TODO: 시간 선택 컴포넌트 추가 */}
          </div>

          {/* 인원 선택 섹션 */}
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

          {/* 총 금액 섹션 */}
          <div className={style['total-price-section']}>
            <div>총 금액</div>
            <div className={style['total-price-value']}>{calcTotalPrice()}원</div>
          </div>

          {/* 예매하기 버튼 섹션 */}
          <div className={style['submit-button-container']}>
            <Button className={style['submit-button']} onClick={orderButtonClickHandler}>
              예매하기 {/* '다음'에서 '예매하기'로 변경 */}
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