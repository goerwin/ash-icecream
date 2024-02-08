import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { CircularProgress } from 'material-ui';

const Wrapper = styled.div`
  background-color: #000;
  opacity: 0.8;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`

const globalLoadingDomEl = document.getElementById('global-loading')!;

export default class GlobalLoading extends React.PureComponent {
  el = document.createElement('div');

  componentDidMount() {
    globalLoadingDomEl.appendChild(this.el);
  }

  componentWillUnmount() {
    globalLoadingDomEl.removeChild(this.el);
  }

  render() {
    return createPortal(
      <Wrapper>
        <CircularProgress />
      </Wrapper>,
      this.el,
    );
  }
}
