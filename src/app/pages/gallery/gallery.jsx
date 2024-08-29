import {Card, Carousel, Flex, Typography} from 'antd';
import {createStyles, useTheme} from 'antd-style';
import dayjs from 'dayjs';
import {useTimelapseImageList} from 'hooks/useTimelapse';
import {useNodeContext} from 'layouts/node/context';
import ImageCarousel, {NextArrow, PrevArrow} from 'pages/gallery/components/ImageCarousel';
import {useState} from 'react';
const {Meta} = Card;
const {Text} = Typography;

// Streaming setup
// import {TimelapseDataUpdate} from 'hooks/useTimelapse';
// const {mutate: updateTimelapse} = useTimelapseImageUpdate();
// const streamUrlArray = useMemo(() => {
//   if (timeRange?.relative && selectedNodes?.length && hub[0].id) {
//     return selectedNodes.map(node => ({
//       url: new URL(
//         `api/timelapse-stream?` + new URLSearchParams({timelapse: node.id, hub: hub[0].id}),
//         globalThis.envault.origin,
//       ).toString(),
//       id: node.id,
//     }));
//   }
//   return null;
// }, [selectedNodes, hub, timeRange]);

// const {data, readyState} = useEventListStream(streamUrlArray, isStream);

// useEffect(() => {
//   if (selectedNodes.length === 0 || !!timeRange.to) return;
//   const allClosed = Object.values(readyState).every(v => v === 2);
//   const onceOpen = Object.values(readyState).includes(1);
//   if (allClosed) {
//     setStreamState(EVENTSTATES.ENABLE);
//   }
//   if (onceOpen) {
//     setStreamState(EVENTSTATES.OPEN);
//   }
// }, [readyState, timeRange, selectedNodes]);

const useStyle = createStyles(({token, css}) => ({
  carousel: css`
    height: 100%;
    width: 100%;
    .slick-list {
      margin: 0 -4px;
    }
    .slick-slide > div {
      padding: 0 4px;
    }
  `,
}));

const getImageList = params => {
  const data = params.data;
  const option = params.config?.option;
  const global = params.config?.global;
  const timelapse = option?.timelapse ?? [];
  const dataList = {timelapse: [], device: []};
  for (const [index, s] of timelapse.entries()) {
    dataList[s.node.type][index] = {
      ...s.node,
      ...data[index],
      to: global?.timeRange?.to,
      from: global?.timeRange?.from,
    };
    delete dataList[s.node.type][index].type;
  }
  return dataList;
};

export const Component = () => {
  const {nodeAttrs, nodeParams, updateNodeParams} = useNodeContext();
  const {option} = nodeParams.config ?? {};
  const {styles, cx} = useStyle();
  // load tokenised data from chart definition
  const theme = useTheme();
  const {timelapse, device} = getImageList(nodeParams);
  const {data: timelapseImage, isFetched, isPending} = useTimelapseImageList({timelapse});
  //const {data: deviceImage, isLoading: isDeviceLoading} = useDeviceImageList({device});

  const [activeTimelapse, setActiveTimelapse] = useState(0);

  return (
    <Flex
      vertical
      style={{
        height: '100%',
      }}
    >
      {option?.timelapse && (
        <ImageCarousel
          imageData={Object.values(timelapseImage)[activeTimelapse]}
          carouselStyle={{
            position: 'relative',
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
            flex: '1 1 auto',
          }}
          isFetched={isFetched}
          isPending={isPending}
          showControl={true}
        />
      )}
      {option?.timelapse?.length > 1 ? (
        <div
          style={{
            position: 'relative',
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
            flex: '1 1 auto',
            maxHeight: '160px',
          }}
        >
          <Carousel
            arrows={true}
            dots={false}
            prevArrow={<PrevArrow isHover={true} />}
            nextArrow={<NextArrow isHover={true} />}
            className={styles.carousel}
            slidesToShow={option.timelapse.length > 2 ? 3 : 2}
            slidesToScroll={1}
            swipeToSlide={true}
            centerMode={option.timelapse.length > 3}
            infinite={true}
            adaptiveHeight={true}
          >
            {option.timelapse.map((node, index) => {
              const url = Object.values(timelapseImage)
                [index]?.sort((a, b) => dayjs(a.datetime).diff(b.datetime))
                .at(-1).url;
              return (
                <div key={index}>
                  <Card
                    hoverable
                    styles={{
                      header: {
                        minHeight: '20px',
                      },
                      title: {
                        textAlign: 'center',
                      },
                      body: {
                        display: 'none',
                      },
                    }}
                    onClick={() => setActiveTimelapse(index)}
                    style={{
                      border:
                        activeTimelapse === index
                          ? `medium solid ${theme.colorPrimary}`
                          : `thin solid ${theme.colorBorder}`,
                    }}
                    title={node.name}
                    cover={
                      <div style={{overflow: 'hidden', height: '120px', padding: '0 1px'}}>
                        <img
                          src={url}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            overflow: 'hidden',
                            borderRadius: `${theme.borderRadius}px`,
                          }}
                        />
                      </div>
                    }
                  />
                </div>
              );
            })}
          </Carousel>
        </div>
      ) : null}
    </Flex>
  );
};
export default Component;
Component.displayName = 'Gallery-Gallery';
