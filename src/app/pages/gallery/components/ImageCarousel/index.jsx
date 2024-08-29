import {Carousel, Flex, Image, Segmented, Skeleton, Slider, Spin, Typography} from 'antd';
import {createStyles, useTheme} from 'antd-style';
import Icon from 'app/components/atoms/Icon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {useMemo, useRef, useState} from 'react';
const {Text} = Typography;
dayjs.extend(utc);

const useStyles = createStyles(({token, css, cx}, {isHover}) => ({
  arrowButton: css`
    position: absolute;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    z-index: 999;
    color: white;
    font-size: 28px;
    visibility: ${isHover ? 'visible' : 'hidden'};
  `,
  left: css`
    left: 0;
  `,
  right: css`
    right: 0;
  `,
  playPause: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 64px;
    color: white;
    display: ${isHover ? 'block' : 'none'};
  `,
}));

export const PrevArrow = props => {
  const {onClick, isHover} = props;
  const {styles, cx} = useStyles({isHover});

  return (
    <div className={cx(styles.arrowButton, styles.left)} onClick={onClick}>
      <Icon icon="LeftCircleFilled" type="ant" />
    </div>
  );
};

export const NextArrow = props => {
  const {onClick, isHover} = props;
  const {styles, cx} = useStyles({isHover});

  return (
    <div className={cx(styles.arrowButton, styles.right)} onClick={onClick}>
      <Icon icon="RightCircleFilled" type="ant" />
    </div>
  );
};

export const ImageLoading = () => {
  return (
    <div style={{position: 'relative', textAlign: 'center', top: '10%'}}>
      <Skeleton.Image active={true} size="large" />
      <Spin size="large" style={{position: 'absolute', left: '50%', top: '25%', transform: 'translate(-50%, -50%)'}} />
    </div>
  );
};

export const EmptyImage = () => {
  return (
    <div style={{position: 'relative', textAlign: 'center', top: '10%'}}>
      <Icon icon="Empty" type={'envault'} raw style={{maxHeight: '300px'}} />
      <h2>{`Nothing to see here, try a different date or add some data`}</h2>
    </div>
  );
};

const ImageCarousel = props => {
  const {imageData = [], carouselStyle, isFetched, isPending, showControl = false} = props;
  const timelapseCarousel = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [current, setCurrent] = useState(imageData.length ?? 0);
  const {styles} = useStyles({isHover});
  const theme = useTheme();

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const marks = useMemo(() => {
    return imageData
      .map((data, index) => ({
        [index]: {
          label: dayjs(data.datetime).local().format('YYYY-MM-DD : hh-mm-ss'),
          style: {
            display: 'none',
          },
        },
      }))
      .reduce((a, v) => ({...a, ...v}), {});
  }, [imageData]);

  const handleSliderChange = value => {
    setAutoPlay(false);
    setCurrent(value);
  };

  const handleSliderAfterChange = value => {
    if (timelapseCarousel.current) {
      timelapseCarousel.current.goTo(value);
    }
  };

  if (isPending) {
    return (
      <div style={{flex: '1 1 auto'}}>
        <ImageLoading />
      </div>
    );
  }

  if (isFetched && !imageData.length) {
    return (
      <div style={{flex: '1 1 auto'}}>
        <EmptyImage />
      </div>
    );
  }

  return (
    <>
      <div
        style={{position: 'relative', ...carouselStyle}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Carousel
          ref={timelapseCarousel}
          arrows={true}
          dots={false}
          autoplay={autoPlay}
          autoplaySpeed={speed}
          prevArrow={<PrevArrow isHover={isHover} />}
          nextArrow={<NextArrow isHover={isHover} />}
          style={{height: '100%', width: '100%'}}
          lazyLoad={'progressive'}
          fade
          initialSlide={!autoPlay ? imageData.length - 1 : 0}
          swipeToSlide={true}
          beforeChange={(old, current) => setCurrent(current)}
        >
          {imageData.map(({url, datetime, target}, index, array) => (
            <div key={index}>
              <Image
                src={url}
                fallback={array[index > 0 ? index - 1 : index].url}
                preview={false}
                placeholder={false}
                height={'100%'}
                width={'100%'}
                style={{
                  objectFit: 'cover',
                }}
                id={datetime}
              />
              <Flex
                wrap
                align={'center'}
                justify={'space-between'}
                gap={'small'}
                style={{
                  padding: '8px',
                  position: 'absolute',
                  width: '100%',
                  zIndex: 9,
                  bottom: 0,
                }}
              >
                <Flex align={'center'} gap={'small'}>
                  <Text
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: theme.borderRadius,
                      padding: '4px 8px',
                    }}
                  >
                    {target}
                  </Text>
                  <Text
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: theme.borderRadius,
                      padding: '4px 8px',
                    }}
                  >
                    {dayjs(datetime).local().format('YYYY-MM-DD : hh-mm-ss')}
                  </Text>
                </Flex>
                <Flex align={'center'} gap={'small'}>
                  <Icon icon="FieldTimeOutlined" type={'ant'} style={{color: 'white', fontSize: '2em'}} />
                  <Segmented
                    options={[
                      {value: 500, label: '0.5s'},
                      {value: 1000, label: '1.0s'},
                      {value: 2000, label: '2.0s'},
                    ]}
                    onChange={setSpeed}
                    style={{backgroundColor: 'rgba(255, 255, 255, 0.7)'}}
                  />
                </Flex>
              </Flex>
            </div>
          ))}
        </Carousel>
        {!autoPlay && (
          <div className={styles.playPause}>
            <Icon icon="PlayCircleFilled" type="ant" onClick={() => setAutoPlay(true)} />
          </div>
        )}
        {autoPlay && (
          <div className={styles.playPause}>
            <Icon icon="PauseCircleFilled" type="ant" onClick={() => setAutoPlay(false)} />
          </div>
        )}
      </div>
      {showControl && (
        <Slider
          max={imageData.length - 1}
          tooltip={{formatter: value => marks[value]?.label}}
          value={current}
          onChangeComplete={handleSliderAfterChange}
          onChange={handleSliderChange}
        />
      )}
    </>
  );
};

export default ImageCarousel;
