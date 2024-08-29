import dayjs from 'dayjs';
import {useEventStream} from 'hooks/useEventStream';
import {useHub} from 'hooks/useHub';
import {useTimelapseImage, useTimelapseImageUpdate} from 'hooks/useTimelapse';
import ImageCarousel from 'pages/gallery/components/ImageCarousel';
import {useEffect, useMemo} from 'react';

const GalleryView = props => {
  const {timeRange, timelapse = null, filterLabel = 'all'} = props;
  const {data: hub} = useHub();
  const {
    data: tokenData = [],
    isFetched,
    isPending,
  } = useTimelapseImage({
    timelapse: +timelapse,
    from: timeRange?.from?.valueOf().toString(),
    to: timeRange?.to?.valueOf().toString() ? timeRange?.to?.valueOf().toString() : dayjs().valueOf().toString(),
  });

  const streamUrl = useMemo(() => {
    if (timelapse && hub[0].id) {
      return new URL(
        `api/timelapse-stream?` + new URLSearchParams({timelapse, hub: hub[0].id}),
        globalThis.envault.origin,
      ).toString();
    } else {
      return null;
    }
  }, [timelapse, hub]);

  const {data} = useEventStream(streamUrl);

  const {mutate: updateTimelapse} = useTimelapseImageUpdate();

  const sortImageFromOldest = (array = []) => {
    return array.sort(function (a, b) {
      return a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : 0;
    });
  };

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
    if (data) {
      updateTimelapse({
        id: timelapse,
        from: timeRange?.from?.valueOf().toString(),
        to: timeRange?.to?.valueOf().toString(),
        newImage: data,
      });
    }
  }, [data, timelapse, timeRange.to, timeRange.from, updateTimelapse]);
  const carouselStyle = {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    flex: '1 1 auto',
  };
  if (!timelapse) return null;

  return (
    <ImageCarousel
      imageData={imageData}
      carouselStyle={carouselStyle}
      isFetched={isFetched}
      isPending={isPending}
      showControl={true}
    />
  );
};
export default GalleryView;
