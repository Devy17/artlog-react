import React, { useRef, useEffect, useState } from 'react';
import styles from './ExhibitionCard.module.scss';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';

function ExhibitionCard({ exhibition }) {
  const [isScrapped, setIsScrapped] = useState(exhibition.isScrapped || false);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

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

  return (
    <div className={styles.comm_ex_item}>
      <a
        href={`/exhibitions/detail/${exhibition.id}`}
        title={`${exhibition.title} 상세페이지로 이동`}
      >
        <figure className={styles.ex_img_fig}>
          <figcaption></figcaption>
          <img
            className={styles.ex_img}
            src={exhibition.imageUrl}
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
      </a>

      <div className={styles.ex_top}>
        <div className={styles.ex_top_flag}>
          {exhibition.isRecommended && (
            <span className={styles.flag}>추천</span>
          )}
        </div>
        <button
          type='button'
          className={`${styles.btn_ico} ${styles.scrap} ${styles.sz_28} ${
            isScrapped ? styles.on : ''
          }`}
          onClick={handleScrapClick}
        >
          {isScrapped ? <FaBookmark /> : <FaRegBookmark />}
          <span className={styles.blind}>스크랩</span>
        </button>
      </div>
    </div>
  );
}

export default ExhibitionCard;
