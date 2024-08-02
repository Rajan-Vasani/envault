import {Carousel, Image, Segmented, Skeleton, Slider, Spin} from 'antd';
import Icon from 'app/components/atoms/Icon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {useMemo, useRef, useState} from 'react';
dayjs.extend(utc);

const arrowButtonStyle = {
  position: 'absolute',
  cursor: 'pointer',
  width: '32px',
  height: '32px',
  zIndex: '999',
  color: 'white',
  fontSize: '28px',
};

export const PrevArrow = props => {
  const {onClick, isHover} = props;

  return (
    <div style={{...arrowButtonStyle, visibility: isHover ? 'visible' : 'hidden'}} onClick={onClick}>
      <Icon icon="LeftCircleFilled" type="ant" />
    </div>
  );
};

export const NextArrow = props => {
  const {onClick, isHover} = props;

  return (
    <div style={{...arrowButtonStyle, visibility: isHover ? 'visible' : 'hidden', right: '0%'}} onClick={onClick}>
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

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const playPauseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '64px',
    color: 'white',
    display: isHover ? 'block' : 'none',
  };

  const marks = useMemo(() => {
    if (imageData.length) {
      setCurrent(imageData.length);
    }
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 9,
            bottom: '4px',
            right: '4px',
            fontSize: '12px',
          }}
        >
          <span style={{color: 'white', paddingRight: '8px', fontSize: '2em'}}>
            <Icon icon="FieldTimeOutlined" type={'ant'} />
          </span>
          <Segmented
            options={[
              {value: 500, label: '0.5s'},
              {value: 1000, label: '1.0s'},
              {value: 2000, label: '2.0s'},
            ]}
            onChange={setSpeed}
            style={{fontSize: '12px'}}
          />
        </div>
        <Carousel
          ref={timelapseCarousel}
          arrows={true}
          dots={false}
          autoplay={autoPlay}
          autoplaySpeed={speed}
          prevArrow={<PrevArrow isHover={isHover} />}
          nextArrow={<NextArrow isHover={isHover} />}
          style={{height: '100%', width: '100%'}}
          lazyLoad={'anticipated'}
          fade
          initialSlide={!autoPlay ? imageData.length - 1 : 0}
          beforeChange={(old, current) => setCurrent(current)}
        >
          {imageData.map(({url, datetime, md5}, index, array) => (
            <div key={md5}>
              <div className="pos-relative">
                <Image
                  src={url}
                  fallback={array[index > 0 ? index - 1 : index].url}
                  preview={false}
                  placeholder={false}
                  height={'100%'}
                  width={'100%'}
                  id={md5}
                />
                <span
                  style={{
                    position: 'absolute',
                    zIndex: 9,
                    bottom: '4px',
                    left: '4px',
                    backgroundColor: 'rgb(255 255 255 / 65%)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                  }}
                >
                  {dayjs(datetime).local().format('YYYY-MM-DD : hh-mm-ss')}
                </span>
              </div>
            </div>
          ))}
        </Carousel>
        {!autoPlay && (
          <div style={playPauseStyle}>
            <Icon icon="PlayCircleFilled" type="ant" onClick={() => setAutoPlay(true)} />
          </div>
        )}
        {autoPlay && (
          <div style={playPauseStyle}>
            <Icon icon="PauseCircleFilled" type="ant" onClick={() => setAutoPlay(false)} />
          </div>
        )}
      </div>
      {showControl && (
        <Slider
          max={imageData.length - 1}
          tooltip={{formatter: value => marks[value].label}}
          value={current}
          onChangeComplete={handleSliderAfterChange}
          onChange={handleSliderChange}
        />
      )}
    </>
  );
};

export default ImageCarousel;
