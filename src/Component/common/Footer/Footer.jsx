import React from 'react';
import styles from './Footer.module.scss';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <div className={styles.footer_wrap}>
        <div className={styles.footer_inner}>
          <p>
            © 2025 <Link to='/'>Artlog.</Link> All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default Footer;
