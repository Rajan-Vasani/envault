import {DndContext, PointerSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {Layout} from 'antd';
import ErrorBoundary from 'components/error/boundary';
import {lazy, useState, useTransition} from 'react';
import {Outlet, useOutletContext} from 'react-router-dom';
const Sider = lazy(() => import('layouts/explore/components/sider'));
const {Content} = Layout;

export const Component = props => {
  const context = useOutletContext();
  const [, startTransition] = useTransition();
  const [showPrivate, setShowPrivate] = useState(false);

  if (!context.isPublic && !showPrivate) {
    startTransition(() => setShowPrivate(true));
  }

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
        {showPrivate && <Sider />}
        <Content>
          <ErrorBoundary {...props}>
            <Outlet context={context} />
          </ErrorBoundary>
        </Content>
      </DndContext>
    </Layout>
  );
};
