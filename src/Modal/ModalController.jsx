// src/components/modal/ModalController.jsx
import React from 'react';
import FindMyIDModal from './FindID/FindMyIDModal';
import FindMyPWModal from './FindPW/FindMyPWModal';
import InsertHintModal_FindID from './FindID/InsertHintModal_FindID';
import InsertHintModal_FindPW from './FindPW/InsertHintModal_FindPW';
import ShowIDModal from './FindID/ShowIDModal';
// import NewPWModal from './FindPW/NewPWModal';
// 필요에 따라 다른 모달도 import

const ModalController = ({ modalType, setModalType }) => {
  const closeModal = () => setModalType(null);

  return (
    <>
      {modalType === 'findID' && <FindMyIDModal onClose={closeModal} />}
      {modalType === 'findPW' && <FindMyPWModal onClose={closeModal} />}
      {modalType === 'insertHint_findID' && (
        <InsertHintModal_FindID onClose={closeModal} type='findID' />
      )}
      {modalType === 'insertHint_findPW' && (
        <InsertHintModal_FindPW onClose={closeModal} type='findPW' />
      )}
      {modalType === 'showID' && <ShowIDModal onClose={closeModal} />}
      {/* {modalType === 'newPW' && <NewPWModal onClose={closeModal} />} */}

      {/* 다른 모달도 필요하면 여기에 추가 */}
    </>
  );
};

export default ModalController;
