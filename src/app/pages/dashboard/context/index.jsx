import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import {createContext, useContext, useState} from 'react';
import {getRange} from 'utils/time';
dayjs.extend(minMax);

export const DashboardContext = createContext({});

export const useDashboardContext = () => {
  return useContext(DashboardContext);
};

export const DashboardProvider = props => {
  const {children, values} = props;
  const {previousData} = values;
  const [editWidget, setEditWidget] = useState();
  const [timeRange, setTimeRange] = useState({...getRange(1), relative: {days: '-1'}});
  const [isEdit, setIsEdit] = useState(!previousData?.id);
  const [isStream, setIsStream] = useState(false);
  const [streamState, setStreamState] = useState();

  const contextValues = {
    previousData,
    timeRange,
    setTimeRange,
    editWidget,
    setEditWidget,
    isEdit,
    setIsEdit,
    isStream,
    setIsStream,
    streamState,
    setStreamState,
  };

  return <DashboardContext.Provider value={contextValues}>{children}</DashboardContext.Provider>;
};

export default DashboardContext;
