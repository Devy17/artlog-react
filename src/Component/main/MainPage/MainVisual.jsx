import React, { useEffect, useState, useRef } from 'react';
import styles from './MainVisual.module.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ExAxiosInstance } from '../../../Axios/ExAxiosConfig';

function MainVisual() {
    const [chunkedExhibitions, setChunkedExhibitions] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [loading, setLoading] = useState(true);  // 로딩 상태 추가
    const timerRef = useRef(null);

    // 데이터 요청 및 매핑
    useEffect(() => {
        const loadExhibitions = async () => {
            try {
                const response = await ExAxiosInstance.get();  // GET 요청 사용
                console.log(response);  // API 응답 로그

                if (response && response.data && response.data.items) {
                    const rawItems = response.data.items;

                    // '테스트'가 포함된 데이터 필터링 및 매핑
                    const mapped = rawItems
                        .filter(item => !item.TITLE.includes("테스트"))  // '테스트'가 포함된 항목 제외
                        .map((item, index) => ({
                            id: item.LOCAL_ID || index,  // 전시 ID
                            imageUrl: item.IMAGE_OBJECT || 'https://placehold.co/400x300?text=No+Image',  // 이미지 URL
                            title: item.TITLE || '제목 없음',  // 전시 제목
                            description: item.DESCRIPTION || '설명 없음',  // 전시 설명
                        }));

                    // 2개씩 묶어서 chunked 배열로 처리
                    const chunks = [];
                    for (let i = 0; i < mapped.length; i += 2) {
                        chunks.push(mapped.slice(i, i + 2));
                    }

                    setChunkedExhibitions(chunks);  // 상태 업데이트
                }
            } catch (error) {
                console.error("Error loading exhibitions:", error);
            } finally {
                setLoading(false);  // 로딩 완료
            }
        };

        loadExhibitions();  // 데이터 요청
    }, []);

    useEffect(() => {
        if (!loading && chunkedExhibitions.length > 0) {
            startAutoSlide();
        }
        return () => clearTimeout(timerRef.current);  // 이전 타이머 제거
    }, [pageIndex, chunkedExhibitions, loading]);

    // 자동 슬라이드 시작
    const startAutoSlide = () => {
        clearTimeout(timerRef.current);  // 기존 타이머 클리어
        timerRef.current = setTimeout(() => {
            goToNext();
        }, 7000);  // 7초 후 다음 슬라이드로 이동
    };

    // 다음 슬라이드로 이동
    const goToNext = () => {
        setPageIndex((prev) => (prev + 1) % chunkedExhibitions.length);
    };

    // 이전 슬라이드로 이동
    const goToPrev = () => {
        setPageIndex((prev) => (prev - 1 + chunkedExhibitions.length) % chunkedExhibitions.length);
    };

    // 로딩 중일 때 로딩 메시지 표시
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
                        >
                            <div className={styles.overlay}>
                                <p className={styles.title}>{item.title}</p>
                                <p className={styles.description}>{item.description}</p>
                            </div>
                        </div>
                    ))}
                    {chunkedExhibitions[pageIndex].length === 1 && (
                        <div className={styles.visual_box_empty} />
                    )}
                </div>
            ) : (
                <p>No exhibitions available</p>  // 데이터가 없을 경우
            )}

            <button className={`${styles.btn_move} ${styles.btn_prev}`} onClick={goToPrev} title="이전">
                <FaChevronLeft />
            </button>
            <button className={`${styles.btn_move} ${styles.btn_next}`} onClick={goToNext} title="다음">
                <FaChevronRight />
            </button>
        </section>
    );
}

export default MainVisual;
