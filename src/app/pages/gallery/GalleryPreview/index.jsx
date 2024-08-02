import {Carousel, Image, Skeleton} from 'antd';
import ImageCarousel, {NextArrow, PrevArrow} from 'components/molecules/ImageCarousel';
import dayjs from 'dayjs';
import {EVENTSTATES, useEventListStream} from 'hooks/useEventStream';
import {useHub} from 'hooks/useHub';
import {useTimelapseDataUpdate, useTimelapseImage, useTimelapseLatestImage} from 'hooks/useTimelapse';
import {useContext, useEffect, useMemo} from 'react';
import GalleryContext from '../context/gallery';

const TimelapseItem = ({node = {}, setActiveTimelapse = () => {}, activeTimelapse}) => {
  const {data: tokenData, isPending} = useTimelapseLatestImage({
    timelapse: node.id,
    to: node?.latest?.datetime,
  });
  return (
    <div
      key={node.id}
      span={6}
      style={{textAlign: 'center', position: 'relative', cursor: 'pointer'}}
      className="envault-gallery-thumbnail-item"
      onClick={() => setActiveTimelapse(node.id)}
    >
      {isPending && <Skeleton.Image active={true} size="large" />}
      {tokenData && (
        <Image
          key={node.id}
          preview={false}
          src={tokenData[0]?.url}
          style={{
            borderRadius: '8px',
            cursor: 'pointer',
            border: activeTimelapse === node?.id ? '2px solid #00aeef' : 'none',
          }}
          placeholder={true}
        />
      )}
      <h5
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          margin: 0,
          padding: '8px',
          zIndex: '2',
          color: 'black',
          backgroundColor: 'rgba(255,255,255, 0.4)',
        }}
      >
        {node.name}
      </h5>
    </div>
  );
};

const GalleryPreview = () => {
  const {
    timeRange,
    selectedNodes,
    filterLabel,
    setFilterLabel,
    setFilterLabelOptions,
    activeTimelapse,
    setActiveTimelapse,
    isStream,
    setStreamState,
  } = useContext(GalleryContext);
  const {data: hub} = useHub();

  const {mutate: updateTimelapse} = useTimelapseDataUpdate();

  const selectedRange = useMemo(() => {
    if (!timeRange?.from) return null;
    return {
      from: timeRange?.from.valueOf().toString(),
      to: timeRange?.to ? timeRange?.to.valueOf().toString() : dayjs().valueOf().toString(),
    };
  }, [timeRange]);

  const {
    data: tokenData = [],
    isFetched,
    isPending,
  } = useTimelapseImage({
    timelapse: activeTimelapse,
    ...selectedRange,
  });

  const streamUrlArray = useMemo(() => {
    if (timeRange?.relative && selectedNodes?.length && hub[0].id) {
      return selectedNodes.map(node => ({
        url: new URL(
          `api/timelapse-stream?` + new URLSearchParams({timelapse: node.id, hub: hub[0].id}),
          globalThis.envault.origin,
        ).toString(),
        id: node.id,
      }));
    }
    return null;
  }, [selectedNodes, hub, timeRange]);

  const {data, readyState} = useEventListStream(streamUrlArray, isStream);

  const sortImageFromOldest = (array = []) => {
    return array.sort(function (a, b) {
      return a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0;
    });
  };

  useEffect(() => {
    if (selectedNodes.length === 0 || !!timeRange.to) return;
    const allClosed = Object.values(readyState).every(v => v === 2);
    const onceOpen = Object.values(readyState).includes(1);
    if (allClosed) {
      setStreamState(EVENTSTATES.ENABLE);
    }
    if (onceOpen) {
      setStreamState(EVENTSTATES.OPEN);
    }
  }, [readyState, timeRange, selectedNodes]);

  const imageData = useMemo(() => {
    if (filterLabel && tokenData && tokenData.length > 0) {
      if (filterLabel === 'all') {
        return sortImageFromOldest(tokenData);
      } else {
        return sortImageFromOldest(tokenData.filter(data => data.label === filterLabel));
      }
    } else {
      return [];
    }
  }, [tokenData, filterLabel]);

  useEffect(() => {
    if (tokenData && tokenData.length) {
      const uniqLabelFromData = [...new Set(tokenData.map(data => data?.label ?? 'Other'))];
      const labelOptions = uniqLabelFromData.map(label => ({label: label, value: label}));
      setFilterLabelOptions(labelOptions);
      if (uniqLabelFromData.indexOf(filterLabel) === -1) {
        setFilterLabel('all');
      }
    }
  }, [tokenData]);

  useEffect(() => {
    if (data && Object.keys(data).length) {
      Object.keys(data).forEach(id =>
        updateTimelapse({
          id,
          ...selectedRange,
          newImage: data[id],
        }),
      );
    }
  }, [data, updateTimelapse]);

  if (!selectedNodes.length) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        padding: '16px',
      }}
    >
      {selectedNodes && (
        <ImageCarousel
          imageData={imageData}
          carouselStyle={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            flex: '1 1 auto',
          }}
          isFetched={isFetched}
          isPending={isPending}
          showControl={true}
        />
      )}
      {selectedNodes.length > 1 ? (
        <div
          style={{
            flex: '0 0 120px',
          }}
          className="envault-gallery-thumbnail"
        >
          <Carousel
            arrows={true}
            dots={false}
            prevArrow={<PrevArrow isHover={true} />}
            nextArrow={<NextArrow isHover={true} />}
            style={{height: '120px'}}
            slidesToShow={selectedNodes.length > 3 ? 3 : 2}
            slidesToScroll={1}
            centerMode={selectedNodes.length > 3}
            centerPadding="60px"
            infinite={true}
            className="center"
            adaptiveHeight={true}
          >
            {selectedNodes.map(node => (
              <TimelapseItem
                key={node.id}
                node={node}
                setActiveTimelapse={setActiveTimelapse}
                activeTimelapse={activeTimelapse}
              />
            ))}
          </Carousel>
        </div>
      ) : null}
    </div>
  );
};
export default GalleryPreview;
