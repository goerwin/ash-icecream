import React from 'react';
import { Receipt } from '../../../schemas';
import {
  deleteReceipt,
  getReportReceipts,
  deleteAllReceipts,
} from '../_helpers/api';
import Reporter from './Reporter';
import ReceiptViewer from './ReceiptViewer';
import ReportPage, { InjectedProps as Props } from '../_hocs/ReportPage';
import {
  convertToPriceFormat,
  convertToDateFormat,
} from '../_helpers/formatter';

interface IState {
  receipt?: Receipt;
}

class Receipts extends React.Component<Props, IState> {
  state: IState = {};

  get totalPrice() {
    const receipts = this.props.reportElements as Receipt[];
    return convertToPriceFormat(
      receipts.reduce((total, el) => total + el.total, 0)
    );
  }

  get totalElementsSold() {
    const receipts = this.props.reportElements as Receipt[];
    return receipts.reduce(
      (total, el) =>
        total + el.products.reduce((total2, el2) => total2 + el2.quantity, 0),
      0
    );
  }

  handleRowDoubleClick = (idx: number, id: string) => {
    const receipt = (this.props.reportElements as Receipt[]).find(
      (el) => el.id === Number(id)
    );
    this.setState({ ...this.state, receipt });
  };

  handleDetailsClose = () => {
    this.setState({ ...this.state, receipt: undefined });
  };

  render() {
    return (
      <>
        {!!this.state.receipt && (
          <ReceiptViewer
            open={!!this.state.receipt}
            onCloseBtnClick={this.handleDetailsClose}
            flavors={this.props.flavors}
            receipt={this.state.receipt}
          />
        )}

        <Reporter
          title="Recibos"
          onTableRowSelected={this.props.onTableRowSelected}
          totalPriceSold={this.totalPrice}
          totalElementsSold={this.totalElementsSold}
          elementIdRowSelected={this.props.elementIdRowSelected}
          isLoading={this.props.isLoading}
          onDateFilterSelected={this.props.onDateFilterSelected}
          filterDateActiveItemId={this.props.filterDateActiveItemId}
          filterStartDate={this.props.filterStartDate}
          filterEndDate={this.props.filterEndDate}
          onTableRowDoubleClick={this.handleRowDoubleClick}
          onBackClick={this.props.onBackClick}
          notification={this.props.notification}
          onCloseNotification={this.props.onCloseNotification}
          elementTitles={[
            { title: 'Fecha' },
            { title: 'Productos' },
            { title: 'Precio Total' },
            { title: 'Pagado' },
            { title: 'Cambio' },
          ]}
          elements={(this.props.reportElements as Receipt[]).map((el) => ({
            id: String(el.id),
            elements: [
              convertToDateFormat(el.date),
              String(
                el.products.reduce((total, el2) => total + el2.quantity, 0)
              ),
              convertToPriceFormat(el.total),
              convertToPriceFormat(el.payment),
              convertToPriceFormat(el.change),
            ],
          }))}
          buttons={[
            { id: 'remove', onClick: this.props.onRemoveClick, name: '🗑' },
            {
              id: 'removeAll',
              onClick: this.props.onDeleteAllElementsClick,
              name: '🗑 Todos',
            },
          ]}
        />
      </>
    );
  }
}

export default ReportPage({
  deleteAllElementsFn: deleteAllReceipts,
  deleteElementFn: deleteReceipt,
  getReportElements: getReportReceipts,
  deleteMessageTitle: 'Eliminar Recibo',
  deleteMessage: 'Quieres eliminar el recibo',
})(Receipts);
