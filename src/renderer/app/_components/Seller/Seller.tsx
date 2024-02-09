import React from 'react';
import styled from 'styled-components';
import { Snackbar } from 'material-ui';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import GlobalLoading from '../GlobalLoading';
import Button from '../Button/Button';
import AddProductToBasket from './AddProductToBasket';
import Calculator from '../Calculator';
import ReceiptViewer from '../ReceiptViewer';
import PasswordAsker from '../PasswordAsker';
import TableViewer from '../TableViewer';
import {
  convertToPriceFormat,
  getFlavorShortNames,
} from '../../_helpers/formatter';
import { Receipt, StoreState, ReceiptProduct } from '../../../../schemas';
import { saveReceiptThunk } from '../../_actions';

const styles = {
  greenColor: '#11de59',
  bottomAreaHeight: 354,
  wrapperRightWidth: 370,
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  &:focus {
    outline: none;
  }
`;

const WrapperLeft = styled.div`
  width: calc(100% - ${styles.wrapperRightWidth}px);
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: #fff;
`;

const WrapperRight = styled.div`
  padding: 10px;
  width: ${styles.wrapperRightWidth}px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
`;

const Header = styled.div`
  overflow: hidden;
  background-color: black;
  padding: 20px 10px;
  height: 158px;
`;

const HeaderItem = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const HeaderTitle = styled.div`
  color: ${styles.greenColor};
  font-size: 30px;
`;

const BottomArea = styled.div`
  position: absolute;
  bottom: 0;
  height: ${styles.bottomAreaHeight}px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  justify-content: space-between;
  border-top: 1px solid #ddd;
  padding: 10px;
  background: #eee;
  box-shadow: 0 1px 9px #888;
`;

const TopArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${styles.bottomAreaHeight}px;
  overflow: auto;
`;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    onCorrectPassword: () => void;
  };

type State = {
  addedProducts: Receipt['products'];
  openedDialogs: {
    receipt: boolean;
    addProduct: boolean;
    passwordAsker: boolean;
  };
  notifications: {
    insuficientPay: boolean;
  };
  rowSelected?: number;
  loading: boolean;
  paymentMode: 'payment' | 'confirm';
  payment?: number;
  change?: number;
  lastReceipt?: Receipt;
};

const tableTitles = [
  { title: 'Producto' },
  { title: 'Cantidad' },
  { title: 'Precio Unidad' },
  { title: 'Precio Total' },
];

class Seller extends React.Component<Props, State> {
  state: State = {
    paymentMode: 'payment',
    loading: false,
    notifications: {
      insuficientPay: false,
    },
    openedDialogs: {
      receipt: false,
      addProduct: false,
      passwordAsker: false,
    },
    addedProducts: [],
  };

  nodeEl?: HTMLElement = undefined;

  get totalPrice() {
    return this.state.addedProducts.reduce(
      (total, el) => total + el.totalPrice,
      0
    );
  }

  get addedProductSelected() {
    return this.state.rowSelected === undefined
      ? undefined
      : this.state.addedProducts[this.state.rowSelected];
  }

  componentDidMount() {
    this.nodeEl = findDOMNode(this.refs.wrapper) as HTMLElement;

    this.nodeEl.onkeydown = (evt) => {
      evt.stopImmediatePropagation();

      if (
        this.state.openedDialogs.addProduct ||
        this.state.openedDialogs.passwordAsker ||
        this.state.openedDialogs.receipt ||
        evt.repeat
      ) {
        return false;
      }

      if (evt.key === 'Enter') {
        if (this.state.paymentMode === 'confirm') {
          this.handleConfirmPayment();
        }
      } else if (evt.key === 'Backspace') {
        if (this.state.paymentMode === 'confirm') {
          this.handleGoBackPayment();
        }
      }

      return false;
    };
  }

  componentWillUnmount() {
    this.nodeEl!.onkeydown = null;
  }

  handleAddProductClick = () => {
    this.setState({
      ...this.state,
      rowSelected: undefined,
      openedDialogs: { ...this.state.openedDialogs, addProduct: true },
    });
  };

  handleCancelAddProduct = () => {
    this.setState({
      ...this.state,
      openedDialogs: { ...this.state.openedDialogs, addProduct: false },
    });
  };

  handleAddEditProduct = (product: ReceiptProduct) => {
    this.giveFocusToWrapper();

    let newReceiptProducts: Receipt['products'] = [];

    if (this.state.rowSelected === undefined) {
      newReceiptProducts = [...this.state.addedProducts, product];
    } else {
      newReceiptProducts = [...this.state.addedProducts];
      newReceiptProducts[Number(this.state.rowSelected)] = product;
    }

    this.setState({
      ...this.state,
      addedProducts: newReceiptProducts,
      openedDialogs: { ...this.state.openedDialogs, addProduct: false },
    });
  };

  handleConfirmPayment = () => {
    const { addedProducts, change, payment } = this.state;

    if (change === undefined || payment === undefined) {
      return;
    }
    if (payment < this.totalPrice) {
      return;
    }

    this.setState({ ...this.state, loading: true });

    const newReceipt: Receipt = {
      id: 0,
      products: addedProducts,
      change,
      payment,
      date: '',
      total: this.totalPrice,
    };

    this.props.addReceipt(newReceipt).then(() => {
      this.setState({
        ...this.state,
        paymentMode: 'payment',
        addedProducts: [],
        change: undefined,
        payment: undefined,
        lastReceipt: newReceipt,
        loading: false,
        openedDialogs: { ...this.state.openedDialogs, receipt: true },
      });
    });
  };

  handleHideNotifications = (reason: string) => {
    if (reason === 'timeout') {
      this.closeNotifications();
    }
  };

  handleGoBackPayment = () => {
    this.setState({ ...this.state, change: undefined, paymentMode: 'payment' });
  };

  cancelPayment = () => {
    this.setState({
      ...this.state,
      payment: undefined,
      change: undefined,
      paymentMode: 'payment',
    });
  };

  closeDialogs = () => {
    this.giveFocusToWrapper();

    this.setState({
      ...this.state,
      openedDialogs: {
        addProduct: false,
        receipt: false,
        passwordAsker: false,
      },
    });
  };

  closeNotifications = () => {
    this.setState({
      ...this.state,
      notifications: {
        insuficientPay: false,
      },
    });
  };

  giveFocusToWrapper = () => {
    this.nodeEl && this.nodeEl.focus();
  };

  handleRowSelected = (idx: number, id: string) => {
    this.setState({ ...this.state, rowSelected: idx });
  };

  handleDeleteSelected = () => {
    if (this.state.rowSelected === undefined) {
      return;
    }

    this.setState({
      ...this.state,
      rowSelected: undefined,
      addedProducts: this.state.addedProducts.filter(
        (el, idx) => idx !== this.state.rowSelected
      ),
    });
  };

  handleEditSelected = () => {
    if (this.state.rowSelected === undefined) {
      return;
    }

    const addedProduct =
      this.state.addedProducts[Number(this.state.rowSelected)];

    this.setState({
      ...this.state,
      openedDialogs: { ...this.state.openedDialogs, addProduct: true },
    });
  };

  handleDeleteAll = () => {
    this.setState({ ...this.state, rowSelected: undefined, addedProducts: [] });
  };

  handleMenuClick = () => {
    this.setState({
      ...this.state,
      openedDialogs: { ...this.state.openedDialogs, passwordAsker: true },
    });
  };

  handleCorrectPass = () => {
    this.props.onCorrectPassword();
  };

  calculator = {
    handleBtnClick: (key: string, value?: number) => {
      this.setState({ ...this.state, payment: value, change: undefined });
    },

    handleDoneClick: () => {
      if (!this.state.payment || this.state.addedProducts.length === 0) {
        return;
      }

      const change = this.state.payment - this.totalPrice;

      if (change < 0) {
        this.setState({
          ...this.state,
          notifications: { ...this.state.notifications, insuficientPay: true },
        });
      } else {
        this.setState({ ...this.state, change, paymentMode: 'confirm' });
      }
    },
  };

  render() {
    return (
      <>
        {this.state.loading && <GlobalLoading />}

        <Snackbar
          open={this.state.notifications.insuficientPay}
          message="Pago Insuficiente!"
          style={{ textAlign: 'center' }}
          onRequestClose={this.handleHideNotifications}
          autoHideDuration={3000}
        />

        <AddProductToBasket
          open={this.state.openedDialogs.addProduct}
          productSelected={this.addedProductSelected}
          products={this.props.db.PRODUCTS}
          categories={this.props.db.CATEGORIES}
          flavors={this.props.db.FLAVORS}
          onAddProduct={this.handleAddEditProduct}
          onCancelClick={this.handleCancelAddProduct}
        />

        <PasswordAsker
          isOpened={this.state.openedDialogs.passwordAsker}
          onCancel={this.closeDialogs}
          onCorrectPass={this.handleCorrectPass}
        />

        {this.state.lastReceipt && (
          <ReceiptViewer
            open={this.state.openedDialogs.receipt}
            printOnEnter
            receipt={this.state.lastReceipt}
            flavors={this.props.db.FLAVORS}
            onCloseBtnClick={this.closeDialogs}
            onDestroy={this.giveFocusToWrapper}
          />
        )}

        <Wrapper tabIndex={0} ref="wrapper">
          <WrapperLeft>
            <TopArea>
              <TableViewer
                titles={tableTitles}
                isSelectable
                rowSelected={String(this.state.rowSelected)}
                onRowSelected={this.handleRowSelected}
                items={this.state.addedProducts.map((el, idx) => ({
                  id: String(idx),
                  elements: [
                    el.name +
                      ' ' +
                      getFlavorShortNames(el.flavors, this.props.db.FLAVORS),
                    '' + el.quantity,
                    convertToPriceFormat(el.unitPrice),
                    convertToPriceFormat(el.totalPrice),
                  ],
                }))}
              />
            </TopArea>

            <BottomArea>
              {this.state.paymentMode === 'payment' && (
                <>
                  <Button isForBottomArea onClick={this.handleAddProductClick}>
                    Agregar Producto
                  </Button>
                  <Button isForBottomArea onClick={this.handleEditSelected}>
                    Editar Seleccionado
                  </Button>
                  <Button isForBottomArea onClick={this.handleDeleteSelected}>
                    Eliminar Seleccionado
                  </Button>
                  <Button isForBottomArea onClick={this.handleDeleteAll}>
                    Eliminar Todos
                  </Button>
                  <Button isForBottomArea onClick={this.handleMenuClick}>
                    Menú
                  </Button>
                </>
              )}
            </BottomArea>
          </WrapperLeft>

          <WrapperRight>
            <Header>
              <HeaderItem>
                <HeaderTitle>Total</HeaderTitle>
                <HeaderTitle>
                  {convertToPriceFormat(this.totalPrice)}
                </HeaderTitle>
              </HeaderItem>

              <HeaderItem>
                <HeaderTitle>Pagar</HeaderTitle>
                <HeaderTitle>
                  {convertToPriceFormat(this.state.payment)}
                </HeaderTitle>
              </HeaderItem>

              <HeaderItem>
                <HeaderTitle>Cambio</HeaderTitle>
                <HeaderTitle>
                  {convertToPriceFormat(this.state.change)}
                </HeaderTitle>
              </HeaderItem>
            </Header>

            {this.state.paymentMode === 'payment' && (
              <Calculator
                style={{ marginTop: 10 }}
                initialValue={this.state.payment}
                shouldFocus={true}
                onButtonClick={this.calculator.handleBtnClick}
                onCancelClick={this.cancelPayment}
                onDoneClick={this.calculator.handleDoneClick}
                onDestroy={this.giveFocusToWrapper}
              />
            )}

            {this.state.paymentMode === 'confirm' && (
              <>
                <Button hasMarginTop onClick={this.handleConfirmPayment}>
                  Confirmar
                </Button>
                <Button hasMarginTop onClick={this.handleGoBackPayment}>
                  Atrás
                </Button>
              </>
            )}
            {/* <Button hasMarginTop>Admin</Button> */}
          </WrapperRight>
        </Wrapper>
      </>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  db: state.DB,
});

const mapDispatchToProps = (dispatch: any) => ({
  addReceipt: (receipt: Receipt) => dispatch(saveReceiptThunk(receipt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Seller);
