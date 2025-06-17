import React, { useContext, useEffect, useState, useRef } from 'react'; // useRef import
import ModalContext from '../ModalContext';
import styles from './OrderCouponModal.module.scss';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API_BASE_URL, COUPON } from '../../Axios/host-config';
import { Button, Card } from '@mui/material';

const OrderCouponModal = ({ onClose, onApply }) => {
  const { setModalType } = useContext(ModalContext);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPriceFromStorage, setTotalPriceFromStorage] = useState(0);

  // ⭐ ref 추가: 모달 내부 요소를 참조하기 위해
  const modalRef = useRef(null);

  useEffect(() => {
    const storedTotal = localStorage.getItem('totalPrice');
    if (storedTotal) {
      setTotalPriceFromStorage(Number(storedTotal));
    }

    const getUserCoupon = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${COUPON}/findByUserKey`,
        );
        setApiData(response.data.result);
        console.log('불러온 쿠폰 데이터:', response.data.result);
      } catch (error) {
        console.error('쿠폰 불러오기 실패:', error);
        setApiData([]);
      } finally {
        setLoading(false);
      }
    };

    getUserCoupon();
  }, []);

  const couponUseHandler = (coupon) => {
    const title = coupon.couponTitle;
    let value = '';
    let isPercent = false;
    let isDiscount = false;

    for (let char of title) {
      if (char >= '0' && char <= '9') {
        value += char;
      } else if (char === '%') {
        isPercent = true;
        break;
      } else if (char === '원') {
        isDiscount = true;
        break;
      }
    }

    const parsedValue = Number(value);

    if (totalPriceFromStorage === 0) {
        alert('무료 전시에는 쿠폰을 적용할 수 없습니다.');
        return;
    }

    if (isPercent) {
      const discountedPrice = totalPriceFromStorage * (1 - parsedValue / 100);
      if (discountedPrice < 0) {
          onApply({ percent: parsedValue, discount: null, userCouponKey: coupon.id });
      } else {
          onApply({ percent: parsedValue, discount: null, userCouponKey: coupon.id });
      }
    } else if (isDiscount) {
      const discountedPrice = totalPriceFromStorage - parsedValue;
      if (discountedPrice < 0) {
          onApply({ discount: totalPriceFromStorage, percent: null, userCouponKey: coupon.id });
      } else {
          onApply({ discount: parsedValue, percent: null, userCouponKey: coupon.id });
      }
    }
    onClose();
  };

  // ⭐ 새로운 함수: 오버레이 클릭 핸들러
  const handleOverlayClick = (e) => {
    // 클릭된 요소가 오버레이 자체인지 확인하고, 모달 내부가 아닌지 확인
    // `e.target`이 오버레이 요소이고, `modalRef.current`가 `e.target`의 자식이 아니라면 (즉, 모달 바깥을 클릭했다면)
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose(); // 모달 닫기 함수 호출
    }
  };


  return (
    // ⭐ overlay에 onClick 이벤트 핸들러 추가
    <div className={styles.overlay} onClick={handleOverlayClick}>
      {/* ⭐ modal에 ref 연결 */}
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>쿠폰 적용</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles['total-price-display']}>
          총 결제 금액: {totalPriceFromStorage.toLocaleString()}원
        </div>

        <div className={styles.body}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              쿠폰 목록을 불러오는 중...
            </div>
          ) : (
            apiData.length > 0 ? (
              <div className={styles['coupon-list-container']}>
                {apiData.map((data) => {
                  const isCouponApplicable = totalPriceFromStorage > 0;

                  return (
                    <Card key={data.id} className={styles['coupon-card']}>
                      <div className={styles['coupon-title']}>{data.couponTitle}</div>
                      <Button
                        onClick={() => couponUseHandler(data)}
                        className={`${styles['apply-button']} ${!isCouponApplicable ? styles['disabled-button'] : ''}`}
                        disabled={!isCouponApplicable}
                      >
                        쿠폰 사용하기
                      </Button>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className={styles['no-coupon-message']}>사용 가능한 쿠폰이 없습니다.</div>
            )
          )}
        </div>

        <div className={styles['bottom-buttons']}>
          <Button
            onClick={onClose}
            className={styles['close-modal-button']}
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderCouponModal;