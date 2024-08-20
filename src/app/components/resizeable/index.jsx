import useResizeObserver from '@react-hook/resize-observer';
import {Button, Col, Flex, Row} from 'antd';
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
  ({token, css, cx, responsive}, {placement, initSize, space, collapsedSize, isResizing}) => {
    const dragPosition = () => {
      const style = css`
        z-index: 100;
        cursor: ew-resize;
        padding: 4px 0 0;
        position: absolute;
      `;
      switch (placement) {
        case 'top':
          return css`
            ${style};
            bottom: -4px;
            left: 0;
            right: 0;
            height: 4px;
            cursor: ns-resize;
          `;
        case 'bottom':
          return css`
            ${style};
            top: -4px;
            left: 0;
            right: 0;
            height: 4px;
            cursor: ns-resize;
          `;
        case 'left':
          return css`
            ${style};
            top: 0;
            bottom: 0;
            right: -4;
            width: 4px;
          `;
        case 'right':
          return css`
            ${style};
            top: 0;
            bottom: 0;
            left: -4;
            width: 4px;
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
      const dimension = space || initSize;
      return isSider
        ? css`
            width: ${dimension}px;
            height: 100%;
          `
        : css`
            height: ${dimension}px;
            width: 100%;
          `;
    };
    const buttonContainerPosition = () => {
      const isCollapsed = space <= collapsedSize;
      switch (placement) {
        case 'left':
          return css`
            top: 80px;
            left: ${isCollapsed ? `${-collapsedSize}px` : 0};
            border-left: none;
            border-radius: 0 ${token.borderRadius}px ${token.borderRadius}px 0;
          `;
        case 'right':
          return css`
            top: 80px;
            right: ${isCollapsed ? `${-collapsedSize}px` : 0};
            border-right: none;
            border-radius: ${token.borderRadius}px 0 0 ${token.borderRadius}px;
          `;
        case 'bottom':
          return css`
            left: 80px;
            bottom: ${isCollapsed ? `${-collapsedSize}px` : 0};
            border-bottom: none;
            border-radius: ${token.borderRadius}px ${token.borderRadius}px 0 0;
          `;
        case 'top':
          return css`
            right: 80px;
            top: ${isCollapsed ? `${-collapsedSize}px` : 0};
            border-top: none;
            border-radius: 0 0 ${token.borderRadius}px ${token.borderRadius}px;
          `;
      }
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
          z-index: ${responsive.mobile ? 98 : 'auto'};
          background: ${token.colorBgLayout};
          transition: ${isResizing.current ? 'none' : `all 300ms ${token.motionEaseOut} 0s`};
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
      buttonContainer: cx(
        css`
          background: ${token.colorBgContainer};
          border: thin solid ${token.colorBorder};
          transition: ${isResizing.current ? 'none' : `all 300ms ${token.motionEaseOut} 0s`};
          position: absolute;
          &:hover {
            border-color: ${token.colorPrimaryBorderHover};
          }
        `,
        buttonContainerPosition(),
      ),
    };
  },
);

const Resizeable = ({children, ...props}) => {
  const {
    initSize = 340,
    placement,
    parent,
    stop,
    collapsible = true,
    collapsed = false,
    collapsedSize = 20,
    onCollapse,
    actions,
  } = props;
  const parentComponent = parent || document.body;
  const parentRef = useRef(parentComponent);
  const parentSize = useSize(parentRef);
  const resizeableRef = useRef(null);
  const currentSize = useSize(resizeableRef);
  const parentSpan = placement === 'top' || placement === 'bottom' ? parentSize.height : parentSize.width;
  const currentSpan = placement === 'top' || placement === 'bottom' ? currentSize.height : currentSize.width;
  const isResizing = useRef(false);
  const currentTarget = useRef(null);
  const [space, setSpace] = useState(collapsed ? collapsedSize : initSize);
  const {styles} = useStyles({
    placement,
    initSize,
    currentSize,
    space,
    collapsed,
    collapsedSize,
    isResizing,
  });

  useEffect(() => {
    setSpace(collapsed ? collapsedSize : initSize);
  }, [collapsed, collapsedSize, initSize]);

  const triggerCollapseChange = value => {
    if (collapsed !== value.collapsed) {
      onCollapse?.(value.collapsed);
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

  const handleMousedown = e => {
    currentTarget.current = e.currentTarget;
    isResizing.current = true;
  };

  const handleMouseup = e => {
    currentTarget.current = null;
    isResizing.current = false;
  };

  const handleMousemove = e => {
    if (!isResizing.current || !currentTarget.current) return;
    e.preventDefault();

    const clientY = e.clientY || e.touches[0].clientY;
    const clientX = e.clientX || e.touches[0].clientX;

    const newSize = {
      top: clientY - parentSize.top,
      bottom: parentSize.bottom - clientY,
      left: clientX - parentSize.left,
      right: parentSize.right - clientX,
    }[placement];

    if (newSize < collapsedSize * 3) {
      setSpace(collapsedSize);
      return triggerCollapseChange({collapsed: true});
    } else {
      triggerCollapseChange({collapsed: false});
    }
    if (newSize > parentSpan - collapsedSize) {
      return setSpace(parentSpan);
    }
    if (newSize > collapsedSize && newSize < parentSpan) {
      return setSpace(newSize);
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
    document.addEventListener('touchmove', handleMousemove, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener('mousemove', handleMousemove);
      document.removeEventListener('touchmove', handleMousemove);
    };
  });

  return (
    <div ref={resizeableRef} className={styles.drawer}>
      <div
        className={styles.dragger}
        onMouseDown={handleMousedown}
        onMouseUp={handleMouseup}
        onTouchStart={handleMousedown}
        onTouchEnd={handleMouseup}
      >
        {collapsible && (
          <div
            className={styles.buttonContainer}
            onMouseDown={handleMousedown}
            onMouseUp={handleMouseup}
            onTouchStart={handleMousedown}
            onTouchEnd={handleMouseup}
          >
            <Flex vertical>
              <Button
                type="text"
                onClick={handleCollapse}
                icon={
                  <Icon icon={space === collapsedSize ? collapsedIcon.collapsed : collapsedIcon.expanded} type="ant" />
                }
                className={styles.button}
              />
              {actions}
            </Flex>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <ModuleMicroHeader {...props} onStopChange={handleStop} fullSize={space === parentSpan} />
        {children}
      </div>
    </div>
  );
};

export default Resizeable;
