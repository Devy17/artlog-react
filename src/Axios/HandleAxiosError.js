export const handleAxiosError = (error, onLogout, navigate) => {
  if (error.response.data?.statusMessage === '쿠폰을 찾을 수 없습니다.') {
    alert(`사용불가능한 쿠폰입니다.\n다시 한번 확인하여주세요`);
    navigate('/coupons');
  } else if (error.response.data?.statusMessage === '서버 오류 발생') {
    alert(`서버에 오류가 발생하였습니다.\n잠시후 다시 시도해주세요`);
    navigate('/coupons');
  } else {
    // 만약 추가해야 할 예외 타입이 더 있다면 else if로 추가해서 써주시면 됩니다.
    throw error;
  }
};
