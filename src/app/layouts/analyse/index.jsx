import {DndContext, PointerSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {Layout} from 'antd';
import ErrorBoundary from 'components/error/boundary';
import {Outlet, useOutletContext} from 'react-router-dom';
const {Content} = Layout;

export const Component = props => {
  const context = useOutletContext();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  return (
    <Layout>
      <DndContext sensors={sensors}>
        <Content>
          <ErrorBoundary {...props}>
            <Outlet context={context} />
          </ErrorBoundary>
        </Content>
      </DndContext>
    </Layout>
  );
};
