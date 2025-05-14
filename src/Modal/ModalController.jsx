import React from 'react';
import SignInPage from '../Page/user/SignInPage'; // ✅ 추가
import FindMyIDModal from './FindID/FindMyIDModal';
import FindMyPWModal from './FindPW/FindMyPWModal';
import InsertHintModal_FindID from './FindID/InsertHintModal_FindID';
import InsertHintModal_FindPW from './FindPW/InsertHintModal_FindPW';
import ShowIDModal from './FindID/ShowIDModal';
import NewPWModal from './FindPW/NewPWModal';
import MyPage from '../Page/user/MyPage';

const ModalController = ({ modalType, setModalType }) => {
  const closeModal = () => setModalType(null);

  return (
    <>
      {modalType === 'login' && <SignInPage onClose={closeModal} />}
      {modalType === 'findID' && <FindMyIDModal onClose={closeModal} />}
      {modalType === 'findPW' && <FindMyPWModal onClose={closeModal} />}
      {modalType === 'insertHint_findID' && (
        <InsertHintModal_FindID onClose={closeModal} type='findID' />
      )}
      {modalType === 'insertHint_findPW' && (
        <InsertHintModal_FindPW onClose={closeModal} type='findPW' />
      )}
      {modalType === 'showID' && <ShowIDModal onClose={closeModal} />}
      {modalType === 'resetPW' && <NewPWModal onClose={closeModal} />}

      {modalType === 'mypage' && <MyPage onClose={closeModal} />}
    </>
  );
};

export default ModalController;
