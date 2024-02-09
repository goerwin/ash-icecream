import React from 'react';
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
import { findDOMNode } from 'react-dom';
import { Dialog } from 'material-ui';
import TableViewer from './TableViewer';
import { Receipt, Flavor } from '../../../schemas';
import Button from './Button/Button';
import ModalButtonsWrapper from './ModalButtonsWrapper';
import {
  convertToPriceFormat,
  convertToDateFormat,
  getFlavorShortNames } from '../_helpers/formatter';

const Wrapper = styled.div`
  background-color: #fff;
  border-radius: 5px;
  padding: 10px;
`

const Separator = styled.div`
  height: 1px;
  background-color: #dadada;
  margin: 10px;
`

const Description = styled.div`
  font-size: 18px;
  color: #999;
  margin-bottom: 10px;
  padding-left: 10px;
`

const tableTitles = [
  { title: 'Producto' },
  { title: 'Cantidad' },
  { title: 'Precio Unidad' },
  { title: 'Precio Total' }
];

interface Props {
  open: boolean;
  receipt: Receipt,
  flavors: Flavor[],
  printOnEnter?: boolean,
  onCloseBtnClick: () => void;
  onDestroy?: () => void;
}

export default class ReceiptViewer extends React.PureComponent<Props, any> {
  nodeEl?: HTMLElement = undefined

  componentDidMount() {
    window.setTimeout(() => {
      this.nodeEl = findDOMNode(this.refs.wrapper) as HTMLElement
      if (!this.nodeEl) { return; }

      this.nodeEl.onkeydown = evt => {
        evt.stopImmediatePropagation()

        if (evt.key === 'Enter' && this.props.printOnEnter) {
          this.handlePrint()
          this.props.onCloseBtnClick()
        } else if (evt.key === 'Escape') {
          this.props.onCloseBtnClick()
        }

        return false
      }

      this.nodeEl.focus();
    }, 400)
  }

  componentWillUnmount() {
    this.nodeEl && (this.nodeEl.onkeydown = null);
  }

  handlePrint = () => {
    const products = this.props.receipt.products.map(el => {
      let title = (el.printName || el.name) + ' ' + getFlavorShortNames(el.flavors, this.props.flavors);
      if (title.length > 60) { title = title.substring(0, 57) + '...'; }

      const quantityText = 'Cant: ' + el.quantity;
      const priceText = convertToPriceFormat(el.totalPrice);
      return { title, quantityText, priceText };
    })

    ipcRenderer.send('PRINT_RECEIPT', JSON.stringify({
      products,
      totalPrice: convertToPriceFormat(this.props.receipt.total),
      payment: convertToPriceFormat(this.props.receipt.payment),
      change: convertToPriceFormat(this.props.receipt.change),
      date: convertToDateFormat(this.props.receipt.date),
    }));
  }

  render() {
    const { receipt } = this.props;
    const actions = [
      <ModalButtonsWrapper>
        <Button type='button' onClick={this.handlePrint}>Imprimir</Button>
        <Button type='button' onClick={this.props.onCloseBtnClick}>Cerrar</Button>
      </ModalButtonsWrapper>
    ]

    return (
      <Dialog
        contentStyle={{ width: 500, maxWidth: 'none' }}
        actions={actions}
        open={this.props.open}
        bodyStyle={{ padding: 0 }}
      >
        <Wrapper ref='wrapper' tabIndex={0}>
          <TableViewer
            titles={tableTitles}
            items={receipt.products.map((el, idx) => ({
              id: String(idx),
              elements: [
                (el.printName || el.name) + ' ' + getFlavorShortNames(el.flavors, this.props.flavors),
                '' + el.quantity,
                convertToPriceFormat(el.unitPrice),
                convertToPriceFormat(el.totalPrice)
              ]
            }))}
          />

          <Separator />
          <Description>Total: {convertToPriceFormat(receipt.total)}</Description>
          <Description>Pagado: {convertToPriceFormat(receipt.payment)}</Description>
          <Description>Cambio: {convertToPriceFormat(receipt.change)}</Description>
          <Description>Fecha: {convertToDateFormat(receipt.date)}</Description>
        </Wrapper>
      </Dialog>
    )
  }
}
