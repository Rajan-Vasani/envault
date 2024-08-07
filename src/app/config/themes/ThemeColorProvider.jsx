import {createContext, useContext, useState} from 'react';

const ThemeColorContext = createContext();

export const ThemeColorProvider = ({children}) => {
  const [primaryContext, setColor] = useState('');

  const setPrimaryColor = color => {
    setColor(color);
  };
  console.log('primaryContext ', primaryContext);

  return <ThemeColorContext.Provider value={{primaryContext, setPrimaryColor}}>{children}</ThemeColorContext.Provider>;
};

export const useThemeApp = () => useContext(ThemeColorContext);
