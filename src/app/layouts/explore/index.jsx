import {DndContext, PointerSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {Layout} from 'antd';
import ErrorBoundary from 'components/error/boundary';
import {TreeSiderSkeleton} from 'components/molecules/Skeleton';
import {Suspense, lazy} from 'react';
import {Outlet, useOutletContext} from 'react-router-dom';
const ExploreSider = lazy(() => import('layouts/explore/components/sider'));
const {Content, Sider} = Layout;

export const Component = props => {
  const {isPublic, ...context} = useOutletContext();

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
        {!isPublic && (
          <Suspense fallback={<TreeSiderSkeleton />}>
            <ExploreSider />
          </Suspense>
        )}
        <Content>
          <ErrorBoundary {...props}>
            <Outlet context={{isPublic, ...context}} />
          </ErrorBoundary>
        </Content>
      </DndContext>
    </Layout>
  );
};
