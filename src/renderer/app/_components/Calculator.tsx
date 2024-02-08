import React from 'react';
import styled from 'styled-components';
import Button from './Button/Button';
import { findDOMNode } from 'react-dom'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-column-gap: 5px;
  grid-row-gap: 10px;

  &:focus {
    outline: none;
  }
`

const Item = styled.div`
  position: relative;

  &::before {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  & > button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  `

const specialButtomItems = [
  { name: '←' },
  { name: 'C' },
  { name: '✕' },
  { name: '✔' },
]

const buttonItems = [
  { name: '1' },
  { name: '2' },
  { name: '3' },
  specialButtomItems[0],
  { name: '4' },
  { name: '5' },
  { name: '6' },
  specialButtomItems[1],
  { name: '7' },
  { name: '8' },
  { name: '9' },
  specialButtomItems[2],
  { name: '00' },
  { name: '0' },
  { name: '000' },
  specialButtomItems[3],
]

interface Props {
  style?: any,
  initialValue?: number,
  shouldFocus?: boolean,
  onCancelClick: (value?: number) => void,
  onDoneClick: (value?: number) => void,
  onButtonClick: (key: string, value?: number) => void,
  onDestroy?: () => void,
}

interface State {
  value?: string;
}

export default class Calculator extends React.Component<Props, State> {
  state = this.calculateInitialState(this.props)

  nodeEl?: HTMLElement = undefined

  calculateInitialState(props: Props) {
    return { value: String(props.initialValue || '') }
  }

  calculateFocus(props: Props) {
    if (!this.props.shouldFocus || !this.nodeEl) { return }
    if (this.nodeEl.contains(document.activeElement)) { return }
    window.setTimeout(() => {
      this.nodeEl && this.nodeEl.focus()
    }, 10)
  }

  componentDidMount() {
    this.nodeEl = findDOMNode(this.refs.wrapper) as HTMLElement

    this.nodeEl.onkeydown = evt => {
      evt.stopImmediatePropagation()

      if (evt.key === 'Backspace') {
        this.manageKey(specialButtomItems[0].name)
        return false
      }

      if (evt.repeat) {
        return false
      } else if (evt.key === 'Enter') {
        this.manageKey(specialButtomItems[3].name)
      } else if (buttonItems.find(el => el.name === evt.key)) {
        this.manageKey(evt.key)
      }
      return false
    }

    this.calculateFocus(this.props)
  }

  componentWillReceiveProps(newProps: Props) {
    this.setState(this.calculateInitialState(newProps))
    this.calculateFocus(newProps)
  }

  componentWillUnmount() {
    this.props.onDestroy && this.props.onDestroy()
    this.nodeEl!.onkeydown = null
  }

  handleButtonClick = (evt: any) => {
    const key = evt.target.textContent;
    this.manageKey(key)
  }

  manageKey = (key: string) => {
    let newValue = this.state.value;

    if (key === specialButtomItems[2].name) {
      this.props.onCancelClick(Number(this.state.value));
      return;
    } else if (key === specialButtomItems[3].name) {
      this.props.onDoneClick(Number(this.state.value));
      return;
    }

    if (key === specialButtomItems[0].name) {
      newValue = this.state.value.slice(0, -1)
    } else if (key === specialButtomItems[1].name) {
      newValue = ''
    } else {
      newValue = this.state.value.concat(key);
    }

    this.props.onButtonClick(key, newValue === '' ? undefined : Number(newValue));

    this.setState({
      ...this.state,
      value: newValue
    })
  }

  render() {
    return (
      <Wrapper {...this.props} ref={'wrapper'} tabIndex={0}>
        {buttonItems.map(el =>
          <Item key={el.name}>
            <Button hasNoPadding onClick={this.handleButtonClick}>{el.name}</Button>
          </Item>
        )}
      </Wrapper>
    )
  }
}
