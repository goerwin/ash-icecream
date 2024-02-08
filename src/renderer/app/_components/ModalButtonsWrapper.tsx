import React from 'react';
import styled from 'styled-components';

const ModalButtonsWrapper = styled.div`
  > button {
    display: inline-block;
    width: auto;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
`

export default (props: any) => <ModalButtonsWrapper {...props}/>
