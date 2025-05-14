// src/components/modal/ModalController.jsx
import React from 'react';
import FindMyIDModal from './FindMyIDModal';
import InsertHintModal from './InsertHintModal_FindID';
import ShowIDModal from './ShowIDModal';
// 필요에 따라 다른 모달도 import

const ModalController = ({ modalType, setModalType }) => {
  const closeModal = () => setModalType(null);

  return (
    <>
      {modalType === 'findID' && <FindMyIDModal onClose={closeModal} />}
      {modalType === 'insertHint_findID' && (
        <InsertHintModal onClose={closeModal} type='findID' />
      )}
      {modalType === 'insertHint_findPW' && (
        <InsertHintModal onClose={closeModal} type='findPW' />
      )}
      {modalType === 'showID' && <ShowIDModal onClose={closeModal} />}
      {/* 다른 모달도 필요하면 여기에 추가 */}
    </>
  );
};

export default ModalController;
