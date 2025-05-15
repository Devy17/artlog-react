import { Card, CardContent, CardMedia, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../Axios/AxiosBackConfig';
import { API, API_BASE_URL } from '../../Axios/host-config';
import { createSearchParams, useNavigate } from 'react-router-dom';
import ContentDetailPage from './ContentDetailPage';
import styles from './ContentViewPage.module.scss';

const ContentViewPage = () => {
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, isLoading] = useState(false);
  const navi = useNavigate();

  const numberOfContent = 9;

  useEffect(() => {
    const getData = async () => {
      const response = await axiosInstance.get(
        `${API_BASE_URL}${API}/select?numOfRows=${numberOfContent}&pageNo=${page}`,
      );
      const data = response.data.result;
      console.log(data);

      console.log(data[0].contentThumbnail);
      return data;
    };

    getData().then((response) => {
      setApiData((prev) => [...prev, ...response]);
    });
  }, [page]);

  useEffect(() => isLoading(true), [apiData]);

  const contentClickHandler = (data) => {
    const param = {
      id: data.contentId,
      title: data.contentTitle,
      venue: data.contentVenue,
      charge: data.contentCharge,
      period: data.contentPeriod,
      thumbnail: data.contentThumbnail,
      url: data.contentUrl,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    navi({
      pathname: '/contentDetail',
      search: '?' + createSearchParams(param).toString(),
    });
  };

  return (
    <div style={{ paddingTop: 300 }}>
      <div>전시 정보</div>
      <div>
        <div>최신순</div>
      </div>
      <div>
        {loading ? (
          <Grid container spacing={2} columns={3}>
            {apiData.map((data) => (
              <Grid
                item
                size={1}
                key={data.contentId}
                onClick={() => contentClickHandler(data)}
              >
                <CardMedia
                  component='img'
                  src={data.contentThumbnail}
                  onError={(e) => {
                    e.target.src = 'vite.svg'; // 대체 이미지 경로
                  }}
                  style={{ width: '90%', height: 800, objectFit: 'cover' }}
                />
                <div>{data.contentTitle}</div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo minus
            itaque iure at dolores pariatur eaque consequuntur nemo a ducimus
            quos, quas omnis culpa nisi adipisci? Harum maiores eos nostrum!
          </div>
        )}
      </div>
      <button onClick={() => setPage(page + 1)}> 더보기 </button>
    </div>
  );
};

export default ContentViewPage;
