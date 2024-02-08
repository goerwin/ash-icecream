import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import React from 'react';
import styled, { StyledFunction } from 'styled-components';
// @ts-ignore
import { DayPickerRangeController } from 'react-dates';
import moment, { Moment } from 'moment';
import Button from '../Button/Button';
import './DateFilter.scss';

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: 150px;
`

const WrapperItems = styled.div`
  margin-right: 10px;
`

const WrapperItem = styled<any, 'div'>('div')`
  padding: 15px 10px;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  color: #999;
  white-space: nowrap;

  ${(props: any) => props.isActive && `
    background-color: #5b5bfb;
    color: #fff;
    border-color: transparent;
    border-radius: 5px;
  `}
`

const Info = styled.div`
  padding: 10px 20px;
  color: #fff;
  border-radius: 5px;
  // display: inline-block;
  position: relative;
  background: #999;
  box-shadow: 0 5px 0 #333;

  &:active {
    top: 3px;
    box-shadow: 0 2px 0 #333;
  }
`

const InfoTitle = styled.div`
  font-size: 12px;
  margin-bottom: 10px;
`

const InfoDesc = styled.div`
  font-size: 20px;
`

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  z-index: 10;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px #333;
  margin-top: 15px;
  display: flex;
  flex-direction: row;
`

const DropdownRightSide = styled.div`
  position: relative;
`

const DropdownButtonsContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  > button {
    width: auto;
    display: inline-block;
    text-align: right;
    margin-left: 10px;
  }
`

interface Props {
  startDate: Moment | null | undefined,
  endDate?: Moment | null | undefined,
  activeItemId?: string,
  onAccept?: (
    startDate: Moment | null | undefined,
    endDate: Moment | null | undefined,
    activeItemId: string | undefined,
  ) => void;
  onCancel?: () => void;
}

interface State {
  startDate?: Moment | null,
  endDate?: Moment | null,
  focusedInput: string,
  activeItemId?: string,
  showDropdown: boolean;
}

const items = [
  { id: 'none', name: 'Ninguno' },
  { id: 'today', name: 'Hoy' },
  { id: 'yesterday', name: 'Ayer' },
  { id: 'thisWeek', name: 'Esta Semana' },
  { id: 'thisMonth', name: 'Este Mes' },
  { id: 'lastWeek', name: 'Semana Pasada' },
  { id: 'lastMonth', name: 'Mes Pasado' },
  { id: 'last7days', name: 'Últimos 7 días' },
  { id: 'custom', name: 'Personalizado' },
]

export default class DateFilter extends React.Component<Props, State> {
  state: State = this.calculateState(this.props)

  calculateState(props: Props): State {
    return {
      startDate: props.startDate,
      endDate: props.endDate,
      activeItemId: props.activeItemId,
      focusedInput: 'startDate',
      showDropdown: false
    }
  }

  get title() {
    if (!this.state.activeItemId || this.state.activeItemId === 'none') { return '-'; }

    const { startDate, endDate } = this.state;
    const format = 'YYYY-MM-DD'
    return `${startDate ? startDate.format(format) : ''} - ` +
      `${endDate ? endDate.format(format) : ''}`
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      this.state.startDate === newProps.startDate &&
      this.state.endDate === newProps.endDate &&
      this.state.activeItemId === newProps.activeItemId
    ) {
      return;
    }

    this.setState({
      ...this.setState,
      activeItemId: newProps.activeItemId,
      startDate: newProps.startDate,
      endDate: newProps.endDate,
    })
  }

  handleItemClick = (id: string) => {
    let startDate = null;
    let endDate = null;
    let focusedInput = this.state.focusedInput;
    let activeItemId = id;

    if (id === 'today') {
      startDate = moment().startOf('day');
      endDate = moment().endOf('day');
    } else if (id === 'yesterday') {
      startDate = moment().subtract(1, 'days').startOf('day')
      endDate = moment().subtract(1, 'days').endOf('day')
    } else if (id === 'thisWeek') {
      startDate = moment().startOf('isoWeek')
      endDate = moment().endOf('isoWeek')
    } else if (id === 'thisMonth') {
      startDate = moment().startOf('month')
      endDate = moment().endOf('month')
    } else if (id === 'lastWeek') {
      startDate = moment().subtract(1, 'week').startOf('isoWeek')
      endDate = moment().subtract(1, 'week').endOf('isoWeek')
    } else if (id === 'lastMonth') {
      startDate = moment().subtract(1, 'month').startOf('month')
      endDate = moment().subtract(1, 'month').endOf('month')
    } else if (id === 'last7days') {
      startDate = moment().subtract(7, 'days').startOf('day')
      endDate = moment().endOf('day')
    } else if (id === 'custom') {
      focusedInput = 'startDate';
      startDate = this.state.startDate;
      endDate = this.state.endDate;
    }

    this.setState({
      ...this.state,
      focusedInput,
      activeItemId,
      startDate,
      endDate
    })
  }

  handleCalendarDatesChange = ({
    startDate,
    endDate
  }: { startDate: Moment | null, endDate: Moment | null }) => {
    this.setState({
      startDate: startDate && startDate.startOf('day').clone(),
      endDate: endDate && endDate.endOf('day').clone(),
      activeItemId: 'custom',
    })
  }

  handleCalendarFocusChange = (focusedInput: string | null) => {
    this.setState({ ...this.state, focusedInput: focusedInput || 'startDate' })
  }

  openDropdown = () => {
    this.setState({ ...this.state, showDropdown: true })
  }

  closeDropdown = () => {
    this.setState(this.calculateState(this.props))
    this.props.onCancel && this.props.onCancel();
  }

  toggleDropdown = () => {
    if (this.state.showDropdown) { this.closeDropdown() }
    else { this.openDropdown() }
  }

  handleAcceptClick = () => {
    this.setState({ ...this.state, showDropdown: false });

    this.props.onAccept && this.props.onAccept(
      this.state.startDate,
      this.state.endDate,
      this.state.activeItemId,
    );
  }

  render() {
    return (
      <Wrapper>
        <Info onClick={this.toggleDropdown}>
          <InfoTitle>Fecha:</InfoTitle>
          <InfoDesc>{this.title}</InfoDesc>
        </Info>

        {this.state.showDropdown &&
          <Dropdown>
            <WrapperItems>
              {items.map(el =>
                <WrapperItem
                  key={el.id}
                  isActive={el.id === this.state.activeItemId}
                  onClick={() => { this.handleItemClick(el.id) }}
                >
                  {el.name}
                </WrapperItem>
              )}
            </WrapperItems>

            <DropdownRightSide>
              <DayPickerRangeController
                minimumNights={0}
                firstDayOfWeek={1}
                numberOfMonths={2}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onDatesChange={this.handleCalendarDatesChange}
                focusedInput={this.state.focusedInput}
                onFocusChange={this.handleCalendarFocusChange}
              />

              <DropdownButtonsContainer>
                <Button onClick={this.closeDropdown}>Cancelar</Button>
                <Button onClick={this.handleAcceptClick}>Aceptar</Button>
              </DropdownButtonsContainer>
            </DropdownRightSide>
          </Dropdown>
        }
      </Wrapper>
    )
  }
}
