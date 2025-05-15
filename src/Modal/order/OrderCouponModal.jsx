import React, { useContext, useEffect, useState } from 'react';
import ModalContext from '../ModalContext';
import styles from './OrderCouponModal.module.scss';

const OrderCouponModal = ({ onClose }) => {
  const { setModalType } = useContext(ModalContext);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>쿠폰 적용</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}></div>
      </div>
    </div>
  );
};

export default OrderCouponModal;
