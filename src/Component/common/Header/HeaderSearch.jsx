import React, { useState } from 'react';
import styles from './HeaderSearch.module.scss';
import { FaSearch } from 'react-icons/fa';

const HeaderSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.headerSearchOverlay} onClick={onClose}>
      <div
        className={styles.headerSearchContent}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type='text'
          className={styles.searchInput}
          placeholder='검색어를 입력해 주세요.'
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default HeaderSearch;
