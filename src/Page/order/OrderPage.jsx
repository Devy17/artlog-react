import { Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 스타일 파일 (원하면 삭제하거나 수정해도 됨)
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, ORDER } from '../../Axios/host-config';
import ModalContext from '../../Modal/ModalContext';

const OrderPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchParams] = useSearchParams();
  const [humanCount, setHumanCount] = useState(1);
  const { setModalType } = useContext(ModalContext);
  const [userCouponKey, setUserCouponKey] = useState(null);

  const navi = useNavigate();

  const calcTotalPrice = () => {
    return +searchParams.get('charge') * humanCount;
  };

  const couponButtonClickHandler = () => {
    // 여기에 coupon Modal 창
    setModalType('orderCoupon');
  };

  const orderButtonClickHandler = () => {
    const getData = async () => {
      const body = {
        contentId: searchParams.get('id'),
        userCouponKey: userCouponKey,
        totalPrice: calcTotalPrice(),
      };

      await axiosInstance
        .post(`${API_BASE_URL}${ORDER}/insert`, body)
        .then((res) => {
          console.log(res.data.result);
        });
    };

    getData();
    alert(searchParams.get('title') + '이 결제되었습니다.');
    navi('/');
  };

  return (
    <div className='order-page'>
      <div className='sidebar'>
        <div className='sidebar-title'>예약</div>
        <div className='image-box'>이미지</div>
        <div className='info'>
          <div>전시 이름</div>
          <div>전시 장소</div>
          <div>전시 일시</div>
          <div>인원</div>
        </div>
      </div>

      <div className='main-content'>
        <div className='date-select-title'>날짜 선택</div>
        <div className='calendar-wrapper'>
          <Calendar
            minDate={new Date()}
            formatDay={(locale, date) => date.getDate()}
            calendarType='gregory'
            onChange={(date) => {
              console.log('선택한 날짜:', date);
              setSelectedDate(date);
            }}
            value={selectedDate}
            locale='ko-KR'
            tileClassName={({ date, view }) => {
              if (
                view === 'month' &&
                selectedDate &&
                date.toDateString() === selectedDate.toDateString()
              ) {
                return 'selected-date';
              }
              return null;
            }}
          />
        </div>
        <div>선택한 날짜 : {selectedDate.toLocaleDateString('ko-KR')}</div>

        <div className='person-select'>
          <div>인원 선택</div>
          <div
            className='counter'
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Button
              onClick={() =>
                setHumanCount((prev) => (prev === 1 ? prev : prev - 1))
              }
            >
              -
            </Button>
            <div>{humanCount}</div>
            <Button onClick={() => setHumanCount((prev) => prev + 1)}>+</Button>
            <Button onClick={() => setHumanCount(1)}>초기화</Button>
          </div>
        </div>

        <div className='price-section'>
          <div>TotalPrice: {+searchParams.get('charge') * humanCount}</div>
          <Button className='coupon' onClick={couponButtonClickHandler}>
            쿠폰 사용하기
          </Button>
        </div>

        <div className='submit-section'>
          <Button className='submit-button' onClick={orderButtonClickHandler}>
            예매하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
