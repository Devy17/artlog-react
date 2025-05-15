import React, { useEffect, useState, useRef } from 'react';
import styles from './MainVisual.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axiosInstance from '../../../Axios/AxiosBackConfig';
import { API_BASE_URL, API } from '../../../Axios/host-config';
import { createSearchParams, useNavigate } from 'react-router-dom';

function MainVisual() {
  const [chunkedExhibitions, setChunkedExhibitions] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const numberOfContent = 6;
  const page = 5;

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${API}/select?numOfRows=${numberOfContent}&pageNo=${page}`,
        );
        const data = response.data.result;

        const mapped = data
          .filter((item) => !item.contentTitle.includes('테스트'))
          .map((item, index) => ({
            id: item.contentId || index,
            imageUrl:
              item.contentThumbnail ||
              'https://placehold.co/400x300?text=No+Image',
            title: item.contentTitle || '제목 없음',
            description: item.contentPeriod || '기간 정보 없음',
            venue: item.contentVenue,
            charge: item.contentCharge,
            url: item.contentUrl,
            startDate: item.startDate,
            endDate: item.endDate,
          }));

        const chunks = [];
        for (let i = 0; i < mapped.length; i += 3) {
          chunks.push(mapped.slice(i, i + 3));
        }

        setChunkedExhibitions(chunks);
      } catch (error) {
        console.error('전시 데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (!loading && chunkedExhibitions.length > 0) {
      startAutoSlide();
    }
    return () => clearTimeout(timerRef.current);
  }, [pageIndex, chunkedExhibitions, loading]);

  const startAutoSlide = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goToNext();
    }, 1500);
  };

  const goToNext = () => {
    setPageIndex((prev) => (prev + 1) % chunkedExhibitions.length);
  };

  const goToPrev = () => {
    setPageIndex(
      (prev) =>
        (prev - 1 + chunkedExhibitions.length) % chunkedExhibitions.length,
    );
  };

  const handleClick = (item) => {
    const params = {
      id: item.id,
      title: item.title,
      venue: item.venue,
      charge: item.charge,
      period: item.description,
      thumbnail: item.imageUrl,
      url: item.url,
      startDate: item.startDate,
      endDate: item.endDate,
    };

    navigate({
      pathname: '/contentDetail',
      search: '?' + createSearchParams(params).toString(),
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <section className={styles.dual_visual}>
      {chunkedExhibitions.length > 0 ? (
        <div className={styles.visual_row}>
          {chunkedExhibitions[pageIndex].map((item) => (
            <div
              key={item.id}
              className={styles.visual_box}
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              onClick={() => handleClick(item)}
            >
              <div className={styles.overlay}>
                <div>
                  <p className={styles.title}>{item.title}</p>
                </div>
              </div>
            </div>
          ))}
          {chunkedExhibitions[pageIndex].length < 3 &&
            Array.from({
              length: 3 - chunkedExhibitions[pageIndex].length,
            }).map((_, idx) => (
              <div key={`empty-${idx}`} className={styles.visual_box_empty} />
            ))}
        </div>
      ) : (
        <p>No exhibitions available</p>
      )}

      <button
        className={`${styles.btn_move} ${styles.btn_prev}`}
        onClick={goToPrev}
        title='이전'
      >
        <FaChevronLeft />
      </button>
      <button
        className={`${styles.btn_move} ${styles.btn_next}`}
        onClick={goToNext}
        title='다음'
      >
        <FaChevronRight />
      </button>
    </section>
  );
}

export default MainVisual;
