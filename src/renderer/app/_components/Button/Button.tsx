import React from 'react';
import styled from 'styled-components';

// TODO: Refactor
let styles: any = {
  redColor: '#b12626',
  redShadowColor: '#650606',
  greenColor: '#11de59',
  greenShadowColor: '#04712b',
  bottomAreaHeight: 354,
  wrapperRightWidth: 370,
}

styles = {
  ...styles,
  btnColor: styles.redColor,
  shadowBtnColor: styles.redShadowColor,
}

const ButtonTag = styled.button`
  border: 0;
  background-color: ${styles.btnColor}
  color: #fff;
  padding: 20px;
  display: block;
  font-size: 30px;
  border-radius: 5px;
  box-shadow: 0 5px 0 ${styles.shadowBtnColor};
  position: relative;
  outline: none;
  width: 100%;

  &:active {
    top: 3px;
    box-shadow: 0 2px 0 ${styles.shadowBtnColor};
  }

  ${(props: any) => !props.hasMarginTop ? '' :
  `
    margin-top: 10px;
  `}

  ${(props: any) => !props.hasNoPadding ? '' :
  `
    padding: 0;
  `}

  ${(props: any) => !props.isForBottomArea ? '' :
  `
    font-size: 10px;
    padding: 5px;
    font-size: 22px;
  `
  }
`;

export default class Button extends React.PureComponent<any, any> {
  render() {
    return (
      <ButtonTag {...this.props} />
    )
  }
}
