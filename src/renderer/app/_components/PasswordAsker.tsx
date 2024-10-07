import React from 'react'
import { Dialog } from 'material-ui'
import styled from 'styled-components'

import Calculator from './Calculator'
// @ts-ignore
import { pwDBStore } from '../../../_singletons/dbInstances'


const Title = styled.div`
  font-size: 40px;
  height: 40px;
  margin-bottom: 12px;
  text-align: center;
  background: #ddd;
  border-radius: 5px;
`

interface Props {
  isOpened: boolean,
  onCancel: () => void,
  onCorrectPass: () => void,
}

interface State {
  currentNumber?: number
}

export default class PasswordAsker extends React.Component<Props, State> {
  state: State = this.calculateInitialState()

  get title() {
    const number = this.state.currentNumber
    if (number === undefined) { return '' }
    return String(number).replace(/./g, '•')
  }

  componentWillReceiveProps() {
    this.setState(this.calculateInitialState())
  }

  calculateInitialState() {
    return { currentNumber: undefined }
  }

  handleBtnClick = (key: string, value?: number) => {
    this.setState({ ...this.state, currentNumber: value })
  }

  handleDoneClick = () => {
    // note: it should be a number
    const pw = pwDBStore.getItem('PW') || 1111;

    if (this.state.currentNumber === pw) {
      this.props.onCorrectPass()
    } else {
      this.setState({ ...this.state, currentNumber: undefined })
    }
  }

  render() {
    return (
      <Dialog
        title='Ingresa la contraseña'
        contentStyle={{ width: 400, maxWidth: 'none' }}
        open={this.props.isOpened}
      >
        <Title>{this.title}</Title>
        <Calculator
          shouldFocus={this.props.isOpened}
          initialValue={this.state.currentNumber}
          onButtonClick={this.handleBtnClick}
          onCancelClick={this.props.onCancel}
          onDoneClick={this.handleDoneClick}
        />
      </Dialog>
    )
  }
}
