// src/components/modal/ModalContext.jsx
import { createContext } from 'react';

const ModalContext = createContext({
  setModalType: () => {}, // 기본값 (실제 값은 App에서 덮어씀)
});

export default ModalContext;
