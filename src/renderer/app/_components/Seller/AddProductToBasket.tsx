import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import {
  MenuItem,
  Dialog,
  Divider,
  SelectField } from 'material-ui'

import Button from '../Button/Button'
import { Product, Category, Flavor, Receipt, ReceiptProduct } from '../../_models'
import ProductElement from './ProductElement'

const Wrapper = styled.div`
  background-color: #fff;
  display: flex;
  height: 500px;
  border-radius: 5px;
  overflow: hidden;
`

const WrapperLeft = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const WrapperRight = styled.div`
  background: #333;
  flex-shrink: 0;
  width: 280px;
  position: relative;
`

const ProductWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  overflow: auto;
  margin: 5px;
`

const QuantityTitle = styled.h2`
  color: #fff;
  font-size: 26px;
  text-align: center;
  margin: 20px 0 0;
`

const WrapperButtons = styled<any, 'div'>('div')`
  display: flex;
  padding: 0 10px;

  > button {
    margin-left: 10px;
    font-size: 20px;

    &:first-child {
      margin-left: 0;
    }
  }

  ${(props: any) => props.isAtBottom && `
    position: absolute;
    bottom: 15px;
    left: 0;
    right: 0;
  `}
`

const NoProducts = styled.div`
  padding: 20px;
  color: #ccc;
  font-size: 20px;
  white-space: nowrap;
`

interface Props {
  open: boolean,
  productSelected?: ReceiptProduct,
  categoryIdSelected?: Category['id'],
  products: Product[],
  categories: Category[],
  flavors: Flavor[],
  onAddProduct: (product: ReceiptProduct) => void,
  onCancelClick: () => void,
}

interface State {
  isEdit: boolean;
  quantity: number;
  selectedCategoryId: Category['id'],
  productSelected?: ReceiptProduct,
}

export default class AddProductToBasket extends React.Component<Props, State> {
  calculateInitialState = (props: Props): State => {
    return {
      isEdit: !!props.productSelected,
      quantity: (props.productSelected && props.productSelected.quantity) || 1,
      productSelected: props.productSelected,
      selectedCategoryId: props.categoryIdSelected || -1,
    }
  }

  state: State = this.calculateInitialState(this.props)

  componentWillReceiveProps(newProps: Props) {
    if (this.props.open === newProps.open) { return; }
    this.setState(this.calculateInitialState(newProps))
  }

  handleLessBtnClick = () => {
    if (this.state.quantity <= 1) { return; }
    this.setState({ ...this.state, quantity: this.state.quantity - 1 })
  }

  handleMoreBtnClick = () => {
    this.setState({ ...this.state, quantity: this.state.quantity + 1 })
  }

  handleAddBtnClick = () => {
    if (!this.state.productSelected) { return; }

    this.props.onAddProduct({
      ...this.state.productSelected,
      quantity: this.state.quantity,
      totalPrice: this.state.quantity * this.state.productSelected.unitPrice
    });
  }

  handleProductSelected = (product: ReceiptProduct) => {
    this.setState({
      ...this.state,
      productSelected: product,
    })
  }

  handleCategoryChange = (evt: any, idx: number, id: Category['id']) => {
    this.setState({ ...this.state, selectedCategoryId: id })
  }

  get filteredProducts() {
    if (this.state.selectedCategoryId === -1) { return this.props.products; }

    if (this.state.selectedCategoryId === -2) {
      return this.props.products.filter(el => !el.category);
    }

    return this.props.products.filter(el => el.category === this.state.selectedCategoryId)
  }

  render() {
    const { productSelected, quantity } = this.state;

    return (
      <Dialog
        contentStyle={{ width: 780, maxWidth: 'none' }}
        open={this.props.open}
        bodyStyle={{ padding: 0 }}
        paperProps={{
          style: { background: 'none' }
        }}
      >
        <Wrapper style={{ width: 780 }}>
          <WrapperLeft>
          <SelectField
            style={{ width: 'auto', margin: '0 20px' }}
            floatingLabelText='Categoría'
            value={this.state.selectedCategoryId}
            onChange={this.handleCategoryChange}
            fullWidth
          >
            <MenuItem key={-1} value={-1} primaryText='Todos' />
            <MenuItem key={-2} value={-2} primaryText='Sin Categoria' />
            <Divider key={'_divider_'} />
            {this.props.categories.map(el =>
              <MenuItem key={el.id} value={el.id} primaryText={el.name} />
            )}
          </SelectField>
            <ProductWrapper>
              {this.filteredProducts.length === 0 ?
                <NoProducts>No Hay Elementos</NoProducts>
                :
                this.filteredProducts.map(el =>
                  <ProductElement
                    {...el}
                    key={el.id}
                    allFlavors={this.props.flavors}
                    productSelected={this.state.productSelected}
                    onProductSelected={this.handleProductSelected}
                  />
                )}
            </ProductWrapper>
          </WrapperLeft>

          <WrapperRight>
            <QuantityTitle>Cantidad</QuantityTitle>
            <QuantityTitle>{quantity}</QuantityTitle>

            <WrapperButtons style={{ marginTop: 20 }}>
              <Button onClick={this.handleLessBtnClick}>-</Button>
              <Button onClick={this.handleMoreBtnClick}>+</Button>
            </WrapperButtons>

            <WrapperButtons isAtBottom>
              <Button onClick={this.props.onCancelClick}>Cancelar</Button>
              <Button onClick={this.handleAddBtnClick}>
                {this.state.isEdit ? 'Editar' : 'Agregar'}
              </Button>
            </WrapperButtons>
          </WrapperRight>
        </Wrapper>
      </Dialog>
    )
  }
}
