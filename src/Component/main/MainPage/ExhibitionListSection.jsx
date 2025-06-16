import React, { useEffect, useState } from 'react';
import ExhibitionCard from './ExhibitionCard';
import styles from './ExhibitionListSection.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axiosInstance from '../../../Axios/AxiosBackConfig';
import { API_BASE_URL, API } from '../../../Axios/host-config';
import { useNavigate } from 'react-router-dom';

function ExhibitionListSection() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    const fetchData = async () => {
      console.log('useEffect 실행됨');
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}${API}/select?numOfRows=18&pageNo=1`,
        );
        const data = response.data.result;

        const mapped = data
          .filter((item) => !item.contentTitle.includes('테스트'))
          .map((item) => ({
            id: item.contentId,
            thumbnail:
              item.contentThumbnail ||
              'https://placehold.co/400x300?text=No+Image',
            title: item.contentTitle || '제목 없음',
            date: item.contentPeriod || '기간 정보 없음',
            location: item.contentVenue || '',
            charge: item.contentCharge || '',
            url: item.contentUrl || '',
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            description: item.description || '',
            isRecommended: Math.random() < 0.3,
            isScrapped: false,
          }));

        setExhibitions(mapped);
      } catch (err) {
        console.error('❌ 요청 실패:', err);
        setError('전시 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maxPage = Math.ceil(exhibitions.length / ITEMS_PER_PAGE);

  const goToNext = () => {
    setPageIndex((prev) => (prev + 1) % maxPage);
  };

  const goToPrev = () => {
    setPageIndex((prev) => (prev - 1 + maxPage) % maxPage);
  };

  const currentItems = exhibitions.slice(
    pageIndex * ITEMS_PER_PAGE,
    (pageIndex + 1) * ITEMS_PER_PAGE,
  );

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`${styles.main_section} ${styles.ex_info}`}>
      <div className={styles.cont_inner}>
        <div className={styles.tit_wrap}>
          <div className={styles.tit_area}>
            <h2 className={styles.tit}>전시정보</h2>
            <div className={styles.side}>
              <button
                className={styles.btn_more}
                onClick={() => navigate('/exhibitions')}
              >
                <span>더보기</span>
              </button>
            </div>
          </div>
          <p className={styles.txt}>
            당신이 궁금한 전시 소식을 한눈에 확인하세요.
            <br className={styles.mo_br} /> 지금, 여기서, 그게 무엇이든!
          </p>
        </div>

        <div className={styles.swiper_pc_3_mo_auto}>
          <div
            className={`${styles.swiper} ${styles.swiper_container_horizontal}`}
          >
            <div className={styles.swiper_wrapper}>
              {currentItems.map((exhibition, index) => (
                <div
                  key={`${exhibition.id}-${index}`}
                  className={`${styles.swiper_slide} ${styles.comm_ex_list}`}
                >
                  <ExhibitionCard exhibition={exhibition} />
                </div>
              ))}
            </div>
          </div>
          <div
            className={`${styles.btn_move} ${styles.button_next}`}
            onClick={goToNext}
          >
            <FaChevronRight />
          </div>
          <div
            className={`${styles.btn_move} ${styles.button_prev}`}
            onClick={goToPrev}
          >
            <FaChevronLeft />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExhibitionListSection;
