import {CheckCircleOutlined, PlayCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';

export const EVENTSTATES = {
  CONNECTING: {state: 'connecting', icon: <SyncOutlined spin />, color: 'processing', value: 0},
  OPEN: {state: 'open', icon: <CheckCircleOutlined />, color: 'success', value: 1},
  DISABLE: {state: 'disable', icon: <PlayCircleOutlined />, color: 'default', value: 2},
  ENABLE: {state: 'enable', icon: <PlayCircleOutlined />, color: 'error', value: 3},
  FETCHING: {state: 'fetching', icon: <SyncOutlined spin />, color: 'success', value: 4},
  FETCHED: {state: 'fetched', icon: <CheckCircleOutlined />, color: 'success', value: 5},
};

export const useEventStream = url => {
  const [data, setData] = useState();
  const [readyState, setReadyState] = useState(false);

  useEffect(() => {
    if (url) {
      const eventSource = new EventSource(url);
      eventSource.onopen = () => {
        setReadyState(true);
      };
      eventSource.onmessage = event => {
        setData(JSON.parse(event.data));
      };

      eventSource.onerror = err => {
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [url]);

  return {data, readyState};
};

export const useEventListStream = (urlArray, enable) => {
  const [data, setData] = useState({});
  const [readyState, setReadyState] = useState({});

  useEffect(() => {
    if (urlArray) {
      const streamList = [];
      if (enable) {
        urlArray.forEach(({url, id}) => {
          setReadyState(prevState => ({...prevState, [id]: 0}));
          const eventSource = new EventSource(url);
          streamList.push(eventSource);

          eventSource.onopen = () => {
            setReadyState(prevState => ({...prevState, [id]: 1}));
          };

          eventSource.onmessage = event => {
            setData(prevState => ({...prevState, [id]: JSON.parse(event.data)}));
          };

          eventSource.onerror = err => {
            eventSource.close();
          };
        });
      } else {
        urlArray.forEach(({id}) => {
          setReadyState(prevState => ({...prevState, [id]: 2}));
        });
        if (streamList.length > 0) {
          streamList.forEach(eventSource => {
            eventSource.close();
          });
        }
      }
      return () => {
        streamList.forEach(eventSource => {
          eventSource.close();
        });
      };
    }
  }, [urlArray, enable]);

  return {data, readyState};
};
