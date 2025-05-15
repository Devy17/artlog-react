import React, { useContext, useEffect, useState } from 'react';
import ModalContext from '../ModalContext';
import styles from './OrderCouponModal.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON, USER } from '../../Axios/host-config';
import { Button, Card } from '@mui/material';

const OrderCouponModal = ({ onClose }) => {
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

  const couponUseHandler = (title) => {
    const titleStr = toString(title);
    let discount = '';
    for (let index = 0; index < titleStr.length; index++) {
      const c = titleStr.charAt(index);
      if (c >= '0' && c <= '9') discount = discount + c;
      else if (c === '-') {
        localStorage.setItem('discount', +discount);
        break;
      } else if (c === '%') {
        localStorage.setItem('percent', +discount)
        break;
      } else {
        break;
      }
    }

    if (!discount) return;

    localStorage.setItem('userCoupon', title);
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

        <div>
          <div>totalPrice : {total}</div>
          {loading
            ? apiData.map((data) => (
                <Card style={{ display: 'flex' }}>
                  <div>{data.couponTitle}</div>
                  <Button
                    onClick={() => couponUseHandler(data.couponTitle)}
                    style={{ color: 'red' }}
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
