import useResizeObserver from '@react-hook/resize-observer';
import {Button, Col, FloatButton, Row} from 'antd';
import {createStyles} from 'antd-style';
import Icon from 'components/atoms/Icon';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';

export const useSize = target => {
  const [size, setSize] = useState({height: 0, width: 0});
  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);
  useResizeObserver(target, entry => setSize(entry.contentRect));
  return size;
};

export const ModuleMicroHeader = props => {
  const {size = 'small', onClose, onExpand, label, stop, onStopChange, fullSize} = props;

  return (
    <Row style={{width: '100%'}}>
      <Col flex={'auto'}>{label}</Col>
      <Col>
        {stop && (
          <Button size={size} onClick={onStopChange} style={{border: 'none'}}>
            <Icon icon={fullSize ? 'DownCircleOutlined' : 'UpCircleOutlined'} type="ant" />
          </Button>
        )}
        {onClose ? (
          <Button size={size} onClick={onClose} style={{border: 'none'}}>
            <Icon icon={'CloseCircleOutlined'} type="ant" />
          </Button>
        ) : null}
      </Col>
    </Row>
  );
};

const useStyles = createStyles(
  ({token, css, cx}, {placement, currentSize, initHeight, initWidth, space, collapsedSize, isResizing}) => {
    const dragPosition = () => {
      const style = css`
        z-index: 98;
        cursor: ew-resize;
        padding: 4px 0 0;
        position: absolute;
      `;
      switch (placement) {
        case 'top':
          return css`
            ${style};
            bottom: -2px;
            left: 0;
            right: 0;
            height: 5px;
            cursor: ns-resize;
          `;
        case 'bottom':
          return css`
            ${style};
            top: -2px;
            left: 0;
            right: 0;
            height: 5px;
            cursor: ns-resize;
          `;
        case 'left':
          return css`
            ${style};
            top: 0;
            bottom: 0;
            right: -2px;
            width: 5px;
          `;
        case 'right':
          return css`
            ${style};
            top: 0;
            bottom: 0;
            left: -2px;
            width: 5px;
          `;
        default:
          return css`
            ${style};
            top: 0;
            bottom: 0;
            left: 0;
          `;
      }
    };
    const borderWidth = {
      top: css`
        border-width: 0 0 thin 0;
      `,
      bottom: css`
        border-width: thin 0 0 0;
      `,
      left: css`
        border-width: 0 thin 0 0;
      `,
      right: css`
        border-width: 0 0 0 thin;
      `,
    }[placement];
    const drawerDimension = () => {
      const isSider = placement === 'left' || placement === 'right';
      const dimensionValue = space || (isSider ? initHeight : initWidth) || undefined;
      const dimension = dimensionValue ? `${dimensionValue}px` : 'auto';
      return isSider
        ? css`
            width: ${dimension};
            height: 100%;
          `
        : css`
            height: ${dimension};
            width: 100%;
          `;
    };
    const buttonPosition = () => {
      const isSider = placement === 'left' || placement === 'right';
      const dimensionValue = space || (isSider ? initHeight : initWidth) || undefined;
      const dimension = dimensionValue ? `${Number(dimensionValue) - 20}px` : 'auto';
      return isSider
        ? css`
            bottom: ${currentSize.height - 120}px;
            left: ${placement === 'left' ? dimension : 'unset'};
            right: ${placement === 'right' ? dimension : 'unset'};
          `
        : css`
            right: ${currentSize.width - 120}px;
            top: ${placement === 'top' ? dimension : 'unset'};
            bottom: ${placement === 'bottom' ? dimension : 'unset'};
          `;
    };

    return {
      content: css`
        width: 100%;
        height: 100%;
        display: ${space === collapsedSize ? 'none' : 'flex'};
        flex-direction: column;
        overflow: hidden;
        padding: ${space === collapsedSize ? collapsedSize : 0}px;
      `,
      drawer: cx(
        drawerDimension(),
        css`
          transition: ${isResizing ? 'none' : `all 300ms ${token.motionEaseOut} 0s`};
          position: relative;
          border: thin solid ${token.colorBorder};
        `,
        borderWidth,
      ),
      dragger: cx(
        dragPosition(),
        css`
          &::after {
            bottom: 0;
            top: 0;
            left: 0;
            right: 0;
            opacity: 0.5;
            pointer-events: none;
            position: absolute;
            transition-duration: 0.22s;
            transition-property: left, opacity, width;
            transition-timing-function: ${token.motionEaseOut};
          }
          &:hover {
            background: ${token.colorPrimaryBorderHover};
          }
        `,
      ),
      button: cx(
        buttonPosition(),
        css`
          z-index: 999;
          transition: ${isResizing ? 'none' : `all 300ms ${token.motionEaseOut} 0s`};
          position: absolute;
        `,
      ),
    };
  },
);

const Resizeable = ({children, ...props}) => {
  const {
    initWidth,
    initHeight,
    placement,
    parent,
    stop,
    collapsible = true,
    collapsed = false,
    collapsedSize = 20,
    onCollapse,
  } = props;
  const parentComponent = parent || document.body;
  const parentRef = useRef(parentComponent);
  const parentSize = useSize(parentRef);
  const resizeableRef = useRef(null);
  const currentSize = useSize(resizeableRef);
  const initSize = placement === 'top' || placement === 'bottom' ? initHeight : initWidth;
  const parentSpan = placement === 'top' || placement === 'bottom' ? parentSize.height : parentSize.width;
  const currentSpan = placement === 'top' || placement === 'bottom' ? currentSize.height : currentSize.width;
  const [isResizing, setIsResizing] = useState(false);
  const [space, setSpace] = useState(collapsed ? collapsedSize : initSize);
  const {styles} = useStyles({
    placement,
    currentSize,
    initHeight,
    initWidth,
    space,
    collapsed,
    collapsedSize,
    isResizing,
  });

  const triggerCollapseChange = value => {
    if (collapsed !== value.collapsed) {
      onCollapse?.(value);
    }
  };

  const handleCollapse = () => {
    if (currentSpan > collapsedSize) {
      setSpace(collapsedSize);
      triggerCollapseChange({collapsed: true});
    } else {
      setSpace(initSize);
      triggerCollapseChange({collapsed: false});
    }
  };

  const collapsedIcon = {
    bottom: {
      expanded: 'DownCircleOutlined',
      collapsed: 'UpCircleOutlined',
    },
    top: {
      expanded: 'UpCircleOutlined',
      collapsed: 'DownCircleOutlined',
    },
    left: {
      expanded: 'LeftCircleOutlined',
      collapsed: 'RightCircleOutlined',
    },
    right: {
      expanded: 'RightCircleOutlined',
      collapsed: 'LeftCircleOutlined',
    },
  }[placement];

  const handleMousedown = () => {
    setIsResizing(true);
  };

  const handleMouseup = () => {
    setIsResizing(false);
  };

  const handleMousemove = e => {
    if (isResizing) {
      const newSize = {
        top: e.clientY - parentSize.top,
        bottom: parentSize.bottom - e.clientY,
        left: e.clientX - parentSize.left,
        right: parentSize.right - e.clientX,
      }[placement];

      if (newSize < collapsedSize * 3) {
        setSpace(collapsedSize);
        return triggerCollapseChange({collapsed: true});
      } else {
        triggerCollapseChange({collapsed: false});
      }
      if (newSize > parentSpan - 5) {
        return setSpace(parentSpan);
      }
      if (newSize > collapsedSize && newSize < parentSpan) {
        return setSpace(newSize);
      }
    }
  };

  const handleStop = () => {
    const stopSpace =
      placement === 'top' || placement === 'bottom'
        ? stop.map(s => Math.round(s * parentSize.height))
        : stop.map(s => Math.round(s * parentSize.width));

    let nextStop;

    if (currentSpan === stopSpace[stop.length - 1]) {
      nextStop = stopSpace[0];
    } else {
      nextStop = stopSpace.filter(s => s > currentSpan)[0];
    }
    setSpace(nextStop);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);

    return () => {
      document.removeEventListener('mousemove', handleMousemove);
      document.removeEventListener('mouseup', handleMouseup);
    };
  });

  return (
    <div ref={resizeableRef} className={styles.drawer}>
      {collapsible && (
        <FloatButton
          onClick={handleCollapse}
          icon={<Icon icon={space === collapsedSize ? collapsedIcon.collapsed : collapsedIcon.expanded} type="ant" />}
          className={styles.button}
          shape={'circle'}
        />
      )}
      <div className={styles.dragger} onMouseDown={handleMousedown}></div>
      <div className={styles.content}>
        <ModuleMicroHeader {...props} onStopChange={handleStop} fullSize={space === parentSpan} />
        {children}
      </div>
    </div>
  );
};

export default Resizeable;
