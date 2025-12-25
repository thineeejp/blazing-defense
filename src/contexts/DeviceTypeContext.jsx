import { createContext, useContext } from 'react';
import { useDeviceType } from '../hooks/useDeviceType';

const DeviceTypeContext = createContext({ isMobile: false, isTouchDevice: false });

export function DeviceTypeProvider({ children }) {
  const deviceType = useDeviceType();
  return (
    <DeviceTypeContext.Provider value={deviceType}>
      {children}
    </DeviceTypeContext.Provider>
  );
}

export function useDeviceTypeContext() {
  return useContext(DeviceTypeContext);
}
