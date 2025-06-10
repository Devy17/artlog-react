import React, { useContext, useEffect, useState } from 'react';
import ModalContext from '../ModalContext';
import styles from './OrderCouponModal.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON, USER } from '../../Axios/host-config';
import { Button, Card } from '@mui/material';

const OrderCouponModal = ({ onClose, onApply }) => {
  const { setModalType } = useContext(ModalContext);
  const [apiData, setApiData] = useState([]);
  const [loading, isLoading] = useState(false);
  const [total, setTotal] = useState(localStorage.getItem('totalPrice'));

  useEffect(() => {
    const getUserCoupon = async () => {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${COUPON}/findByUserKey`,
      );

      console.log(response);
      return response.data.result;
    };

    getUserCoupon().then((res) => {
      setApiData((prev) => [...prev, ...res]);
    });
  }, []);

  useEffect(() => {
    isLoading(true);
  }, [apiData]);


  const couponUseHandler = (coupon) => {
    const title = coupon.couponTitle;
    let value = '';
    for (let c of title) {
      if (c >= '0' && c <= '9') value += c;
      else if (c === '%') {
        onApply({ percent: +value, discount: null, userCouponKey: coupon.id });
        break;
      } else if (c === '원') {
        onApply({ discount: +value, percent: null, userCouponKey: coupon.id });
        break;
      }
    }
    onClose();
  };


  return (
<div className={styles.overlay}>
  <div className={styles.modal}>
    <div className={styles.header}>
      <h2 className={styles.title}>쿠폰 적용</h2>
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>
    </div>

    <div> {/* 이 div는 totalPrice와 쿠폰 목록을 감싸는 부분입니다. */}
      <div>totalPrice : {total}</div> {/* 현재 totalPrice 표시 부분 */}
      {loading
        ? apiData.map((data, idx) => (
            <Card key={idx} style={{display: 'flex'}}> {/* Material-UI Card 사용 중 */}
              <div>{data.couponTitle}</div>
              <Button
                onClick={() => couponUseHandler(data)}
                style={{color: 'red'}} // 현재 Material-UI Button에 인라인 스타일 적용 중
              >
                쿠폰 사용하기
              </Button>
            </Card>
          ))
        : 'Loading'}
    </div>

    <div className={styles.body}></div>
  </div>
</div>
  );
};

export default OrderCouponModal;
