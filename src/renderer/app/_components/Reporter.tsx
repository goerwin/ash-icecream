import React from 'react';
import Button from './Button/Button';
import { Moment } from 'moment';
import { Snackbar } from 'material-ui';
import styled from 'styled-components';
import DateFilter from './DateFilter/DateFilter';
import TableViewer from './TableViewer';
import GlobalLoading from './GlobalLoading';

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`

const WrapperTop = styled.div`
  background-color: #f1f1f1;
  padding: 10px;
  height: 190px;
  flex-shrink: 0;
  position: relative;
`

const WrapperBottom = styled.div`
  background-color: #fff;
  height: 100%;
  overflow: auto;
`

const Title = styled.div`
  font-size: 30px;
  margin-bottom: 10px;
  color: #999;
`

const TopButtonsContainer = styled.div`
`

const Description = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: #dadada;
  padding: 20px;
`

const DescriptionItem = styled.div`
  color: #999;
  font-size: 20px;
  margin-top: 10px;
  float: left;
  width: 100%;
`

const DescriptionItemRight = styled.span`
  float: right;
`

const ButtonsContainer = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;

  > button {
    display: inline-block;
    padding-top: 0;
    padding-bottom: 0;
    width: auto;
    min-width: 70px;
    height: 70px;
    margin-left: 10px;
  }
`

interface Props {
  title: string,
  filterDateActiveItemId?: string;
  filterStartDate?: Moment | null;
  filterEndDate?: Moment | null;
  totalElementsSold: number,
  totalPriceSold: string,
  isLoading: boolean;
  notification: string;
  elementIdRowSelected?: number,
  elementTitles: { title: string}[],
  elements: { id: string, elements: (string | number)[] }[],
  buttons: { id: string, name: string, onClick: () => void }[],
  onBackClick: () => void;
  onTableRowSelected?: (row: number, id: string) => void,
  onTableRowDoubleClick?: (row: number, id: string) => void,
  onCloseNotification: () => void;
  onDateFilterSelected?: (
    startDate: Moment | null | undefined,
    endDate: Moment | null | undefined,
    activeItemId: string | undefined,
  ) => void;
}

export default class Reporter extends React.Component<Props> {
  render() {
    return (
      <>
        <Snackbar
          open={!!this.props.notification}
          message={this.props.notification}
          style={{ textAlign: 'center' }}
          onRequestClose={this.props.onCloseNotification}
          autoHideDuration={3000}
        />

        {!!this.props.isLoading && <GlobalLoading />}

        <Wrapper>
          <WrapperTop>
            <Title>{this.props.title}</Title>
            <TopButtonsContainer>
              <DateFilter
                activeItemId={this.props.filterDateActiveItemId}
                startDate={this.props.filterStartDate}
                endDate={this.props.filterEndDate}
                onAccept={this.props.onDateFilterSelected}
              />
            </TopButtonsContainer>
              <Button
                style={{ marginTop: '11px', width: 'auto', padding: '10px 20px' }}
                onClick={this.props.onBackClick}
              >
                Menú
              </Button>

            <Description>
              <DescriptionItem>
                Vendidos:
                <DescriptionItemRight>{this.props.totalElementsSold}</DescriptionItemRight>
              </DescriptionItem>
              <DescriptionItem>
                Precio Total:
                <DescriptionItemRight>{this.props.totalPriceSold}</DescriptionItemRight>
              </DescriptionItem>

              <ButtonsContainer>
                {this.props.buttons.map(el =>
                  <Button key={el.id} onClick={el.onClick}>{el.name}</Button>
                )}
              </ButtonsContainer>
            </Description>
          </WrapperTop>

          <WrapperBottom>
            <TableViewer
              onRowSelected={this.props.onTableRowSelected}
              onRowDoubleClick={this.props.onTableRowDoubleClick}
              isSelectable
              rowSelected={
                this.props.elementIdRowSelected === undefined ?
                undefined : String(this.props.elementIdRowSelected)
              }
              items={this.props.elements}
              titles={this.props.elementTitles}
            />
          </WrapperBottom>
        </Wrapper>
      </>
    )
  }
}
