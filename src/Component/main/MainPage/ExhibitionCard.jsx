import React, { useRef, useEffect, useState } from 'react';
import styles from './ExhibitionCard.module.scss';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { useNavigate, createSearchParams } from 'react-router-dom';

function ExhibitionCard({ exhibition }) {
  const [isScrapped, setIsScrapped] = useState(exhibition.isScrapped || false);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = titleRef.current;
    const container = containerRef.current;
    if (el && container && el.scrollWidth > container.clientWidth) {
      setShouldScroll(true);
    } else {
      setShouldScroll(false);
    }
  }, [exhibition.title]);

  const handleScrapClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsScrapped(!isScrapped);
  };

  const handleCardClick = () => {
    console.log('exhibition 객체 구조 확인:', exhibition);

    const param = {
      id: exhibition.id,
      thumbnail:
        exhibition.thumbnail || 'https://placehold.co/400x300?text=No+Image',
      title: exhibition.title || '제목 없음',
      description:
        exhibition.description ||
        (exhibition.date ? exhibition.date.toString() : '기간 정보 없음'),
      venue: exhibition.location || '',
      charge: exhibition.charge || '무료',
      url: exhibition.url || '',
      startDate: exhibition.startDate || '',
      endDate: exhibition.endDate || '',
    };

    console.log('전시 정보 param:', param);

    navigate({
      pathname: '/contentDetail',
      search: '?' + createSearchParams(param).toString(),
    });
  };

  return (
    <div className={styles.comm_ex_item} onClick={handleCardClick}>
      <figure className={styles.ex_img_fig}>
        <figcaption></figcaption>
        <img
          className={styles.ex_img}
          src={
            exhibition.thumbnail || 'https://placehold.co/400x300?text=No+Image'
          }
          alt={`전시정보 관련 포스터: ${exhibition.title}`}
        />
      </figure>

      <div className={styles.ex_guide}>
        <div
          ref={containerRef}
          className={`${styles.title_wrapper} ${shouldScroll ? styles.overflow_ready : ''}`}
        >
          <span ref={titleRef} className={styles.ex_sbj}>
            {exhibition.title}
          </span>
        </div>

        <div className={styles.ex_loc_row}>
          <span className={`${styles.ex_loc} ${styles.ex_loc_sub}`}>
            {exhibition.location}
          </span>
        </div>
      </div>

      <div className={styles.ex_top}>
        <div className={styles.ex_top_flag}>
          {exhibition.isRecommended && (
            <span className={styles.flag}>추천</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExhibitionCard;
