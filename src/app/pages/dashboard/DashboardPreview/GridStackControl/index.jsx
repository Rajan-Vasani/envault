import {useDndMonitor, useDroppable} from '@dnd-kit/core';
import {Form, Input} from 'antd';
import {createStyles, useTheme} from 'antd-style';
import {GridStack} from 'gridstack';
import 'gridstack/dist/gridstack-extra.css';
import 'gridstack/dist/gridstack.min.css';
import {createRef, useContext, useEffect, useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import DashboardContext from '../../context';
import GridItem from '../GridStackWidgetItem';
import {DashboardStart} from './DashboardStart';

const useStyles = createStyles(({token, css}) => ({
  content: css`
    box-shadow: ${token.boxShadowSecondary};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgElevated};
  `,
  gridStack: css`
    min-height: 100%;
    background-color: ${token.colorBgContainer};
    .grid-stack-item > .ui-resizable-handle {
      z-index: 999999 !important;
    }
  `,
}));

const GridStackControl = ({widgetItems = [], removeWidget, addWidget}) => {
  const token = useTheme();
  const gridRef = useRef(null);
  const refs = useRef({});
  const [form] = Form.useForm();
  const {isEdit} = useContext(DashboardContext);
  const [view, setView] = useState('full');
  const {styles, cx} = useStyles();

  useEffect(() => {
    if (Object.keys(refs.current).length !== widgetItems.length) {
      widgetItems.forEach(({id}) => {
        refs[id].current = refs[id].current || createRef();
      });
    }
  }, [widgetItems]);

  const [dropInWidget, setDropInWidget] = useState(false);
  const [dropData, setDropData] = useState(null);
  const {active, over} = useDroppable({});

  const handleDragItemEnd = (active, over) => {
    if (!over) {
      setDropInWidget(false);
      return;
    }
    if (+active.id !== +over.id) {
      setDropInWidget(true);
    }
  };

  useDndMonitor({
    onDragStart() {},
    onDragMove() {},
    onDragOver() {},
    onDragEnd({active, over}) {
      handleDragItemEnd(active, over);
    },
    onDragCancel() {},
  });

  const addEvents = grid => {
    grid.on('added removed change', function (event, items) {
      if (!items) return;
      if (event.type === 'added' && items[0]?.el?.className?.includes('newWidget')) {
        const {x, y, w, h, id, el} = items[0];
        const itemType = el.title;
        grid.removeWidget(el);
        setDropData({
          id: uuidv4(),
          data: {},
          gridstack: {x, y, w, h},
          widgetData: ['series', 'timelapse'].includes(itemType) ? {series: [id]} : {id},
          type: el.attributes['gs-type'].value,
        });
        return;
      }
      const updatedLayout = {};
      const gridChild = grid.el.childNodes ?? [];
      gridChild.forEach(element => {
        const {x, y, w, h} = element.gridstackNode ?? {};
        updatedLayout[element.id] = {x, y, w, h};
      });
      form.setFieldsValue({gridstack: updatedLayout});
      form.validateFields();
    });
  };

  useEffect(() => {
    gridRef.current = GridStack.init({
      cellHeight: 100,
      acceptWidgets: true,
      float: true,
      dragIn: '.newWidget',
    });
  }, []);

  useEffect(() => {
    const responsiveGrid = () => {
      let width = document.body.clientWidth;
      if (width < token.screenMD) {
        setView('mobile');
      } else if (width < token.screenXL) {
        setView('tablet');
      } else {
        setView('full');
      }
    };
    window.addEventListener('resize', responsiveGrid);
    return () => window.removeEventListener('resize', responsiveGrid);
  }, [token]);

  useEffect(() => {
    if (view === 'tablet') {
      gridRef?.current.column(6, 'list');
    }
    if (view === 'mobile') {
      gridRef?.current.column(3, 'list');
    }
    if (view === 'full') {
      gridRef?.current.column(12, 'list');
    }
  }, [view]);

  useEffect(() => {
    if (widgetItems.length === 0) {
      gridRef.current.removeAll();
    }
    if (gridRef?.current) {
      gridRef.current.removeAll(false);
      gridRef.current.batchUpdate();
      widgetItems.forEach(({id}) => {
        gridRef.current.makeWidget(refs.current[id]?.current);
      });
      gridRef.current.batchUpdate(false);
      addEvents(gridRef.current);
    }
  }, [widgetItems]);

  useEffect(() => {
    if (gridRef.current.setStatic) {
      gridRef.current.setStatic(!isEdit);
    }
  }, [isEdit]);

  useEffect(() => {
    if (dropInWidget || !dropData) {
      return;
    }
    if (dropData) {
      addWidget(dropData);
    }
    return () => {
      setDropData(null);
    };
  }, [dropData]);

  useEffect(() => {
    const widgetId = over?.data?.current?.target;
    if (active && widgetId && gridRef.current) {
      gridRef.current.update(refs.current[widgetId]?.current, {locked: true});
    }
  }, [over, active]);

  return (
    <>
      <Form form={form} name="layout">
        <Form.Item name="gridstack" hidden>
          <Input type="text" />
        </Form.Item>
      </Form>
      <div ref={gridRef} className={cx('grid-stack', styles.gridStack)} id="gridstack">
        {widgetItems?.map(item => {
          const {id, gridstack} = item;
          return (
            <div
              ref={refs[id]}
              key={id}
              id={id}
              className="grid-stack-item ui-draggable ui-resizable ui-resizable-autohide"
              gs-w={gridstack?.w ?? '6'}
              gs-h={gridstack?.h ?? '4'}
              gs-x={gridstack?.x}
              gs-y={gridstack?.y}
            >
              <div className={cx('grid-stack-item-content', styles.content)}>
                <GridItem item={item} removeWidget={removeWidget} />
              </div>
            </div>
          );
        })}
        {widgetItems.length === 0 && <DashboardStart addWidget={addWidget} />}
      </div>
    </>
  );
};

export default GridStackControl;
