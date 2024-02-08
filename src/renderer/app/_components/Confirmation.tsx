import React from 'react'
import { Dialog } from 'material-ui'
import styled from 'styled-components';
import Button from './Button/Button'
import ModalButtonsWrapper from './ModalButtonsWrapper'

const Title = styled.div`
  color: #666;
  margin-bottom: 20px;
  font-size: 25px;
  `

  const Message = styled.div`
  color: #666;
  font-size: 20px;
`

interface Props {
  isOpened: boolean,
  title?: string,
  message?: string,
  onAccept: () => void,
  onCancel: () => void,
}

export default class Confirmation extends React.PureComponent<Props, any> {
  render() {
    return (
      <Dialog
        open={this.props.isOpened}
        actions={[
          <ModalButtonsWrapper>
            <Button onClick={this.props.onCancel}>Cancelar</Button>
            <Button onClick={this.props.onAccept}>Aceptar</Button>
          </ModalButtonsWrapper>
        ]}
      >
        <Title>{this.props.title}</Title>
        <Message>{this.props.message}</Message>
      </Dialog>
    )
  }
}
