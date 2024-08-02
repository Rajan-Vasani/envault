import {Button, Layout, Result} from 'antd';
import {createStyles} from 'antd-style';
import {Component} from 'react';
import {Link} from 'react-router-dom';
const {Content} = Layout;

const useStyles = createStyles(({token, css}) => ({
  container: css`
    display: flex;
    text-align: center;
    overflow: auto;
    flex-flow: column;
    height: 100%;
  `,
}));

export function ApplicationError(props) {
  const {error, isModal, meta, isCritical, isCompileError, handleModal} = props;
  const styles = useStyles();

  const PageReload = () => (
    <Button type="primary" onClick={() => window.location.reload()}>
      Try a page reload
    </Button>
  );

  const ModalAbort = () => (
    <Button
      onClick={() => {
        handleModal(false);
      }}
    >
      Cancel
    </Button>
  );

  const SubTitle = () => (
    <>
      [{error?.code ? error.code : 'CRITICAL'}] {error?.title ? error.title + ': ' : ''}{' '}
      {error?.message ? error.message : ''}
    </>
  );

  if (isCritical === true) {
    return (
      <div className={styles.container}>
        <Result
          status="warning"
          title={'Critical Application Error'}
          subTitle={<SubTitle />}
          extra={isModal && handleModal ? <ModalAbort /> : <PageReload />}
        />
      </div>
    );
  }

  if (isCompileError === true) {
    return (
      <div className={styles.container}>
        <Result
          status="warning"
          title={'Critical Compilation Error'}
          subTitle={<SubTitle />}
          extra={isModal && handleModal ? <ModalAbort /> : <PageReload />}
        />
      </div>
    );
  }

  if (error?.code === 'NO_MATCH') {
    return (
      <Result
        status="warning"
        title="The record you are looking for no longer exists."
        subTitle={<SubTitle />}
        extra={
          isModal && handleModal ? (
            <ModalAbort />
          ) : meta?.path ? (
            <Link to={meta?.path}>
              <Button type="primary">Return To List</Button>
            </Link>
          ) : (
            false
          )
        }
      />
    );
  }

  return (
    <Content>
      <Result
        status="warning"
        title={isCritical ? 'Critical Application Error' : 'Application Module Error'}
        subTitle={<SubTitle />}
        extra={
          isModal && handleModal ? (
            <ModalAbort />
          ) : (
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          )
        }
      />
    </Content>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  // Catch errors in any components below and re-render with error message
  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  // Reset the error state when a component is updated
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ApplicationError {...this.props} isCompileError={this.state.hasError} error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
