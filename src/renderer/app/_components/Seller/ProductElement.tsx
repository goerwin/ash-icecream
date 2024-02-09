import React from 'react'
import styled from 'styled-components'

import { convertToPriceFormat } from '../../_helpers/formatter'
import { Flavor, Product, ReceiptProduct } from '../../../../_helpers/models'
import ProductFlavorPicker, { getFlavorName } from './ProductFlavorPicker'

const ProductDiv = styled.div`
  position: relative;

  &::before {
    content: '';
    padding-bottom: 100%;
    display: block;
  }
`

const ProductContent = styled<any, 'div'>('div')`
  cursor: pointer;
  // background-color: #ffb90a;
  position: absolute;
  box-shadow: inset 0 0 25px #ddd;
  border: 1px solid #ddd;
  color: #666;
  border-radius: 5px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 5px 5px;
  text-align: center;
  font-size: 22px;
  overflow: hidden;

  ${(props: any) => props.isHighlighted && `
    background-color: #5b5bfb;
    border-color: #5b5bfb;
    box-shadow: inset 0 0 23px #000;
    color: #fff;
  `}
`

const ProductContentPrice = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
`

const ProductContentName = styled.div`
  height: 50px;
  overflow: hidden;
  margin-bottom: 3px;
`

const ProductContentFlavors = styled.div`
  font-size: 14px;
  color: #bbb;
  height: 60px;
  overflow: hidden;
`

const ProductContentFlavor = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface Props extends Product {
  allFlavors: Flavor[],
  productSelected?: ReceiptProduct,
  onProductSelected: (product: ReceiptProduct) => void,
}

interface State {
  flavorsSelected: (Flavor['id'] | null)[],
  showDropdown?: boolean,
}

export default class ProductElement extends React.Component<Props, State> {
  state: State = this.calculateInitialState(this.props)
  parentRef = null

  calculateInitialState(props: Props) {
    return {
      flavorsSelected: this.props.flavors.map((el, idx) =>
        el.flavorOptions.length === 1 ? el.flavorOptions[0] :
          (this.props.productSelected && this.props.productSelected.flavors[idx]) || null
      )
    }
  }

  handleProductClick = () => {
    if (this.state.showDropdown) {
      this.setState({ ...this.state, showDropdown: false })
    } else if (this.state.flavorsSelected.length === 0) {
      this.props.onProductSelected({
        id: this.props.id,
        category: this.props.category,
        name: this.props.name,
        printName: this.props.printName,
        flavors: [],
        unitPrice: this.props.price,
        quantity: -1,
        totalPrice: -1,
      })
      this.setState({ ...this.state, showDropdown: false })
    } else if (
      this.state.flavorsSelected.length > 0 &&
      this.state.flavorsSelected.every(el => el !== null)
    ) {
      this.props.onProductSelected({
        id: this.props.id,
        category: this.props.category,
        printName: this.props.printName,
        name: this.props.name,
        flavors: this.state.flavorsSelected as number[],
        unitPrice: this.props.price,
        quantity: -1,
        totalPrice: -1,
      })
      this.setState({ ...this.state, showDropdown: false })
    } else {
      this.setState({ ...this.state, showDropdown: true })
    }
  }

  handleDoubleClick = () => {
    if (this.state.flavorsSelected.length > 0) {
      this.setState({ ...this.state, showDropdown: true })
    }
  }

  handleSelectChange = (idx: number, value: any) => {
    this.state.flavorsSelected[idx] = value;

    if (
      this.state.flavorsSelected.length > 0 &&
      this.state.flavorsSelected.every(el => el !== null)
    ) {
      this.props.onProductSelected({
        id: this.props.id,
        category: this.props.category,
        name: this.props.name,
        printName: this.props.printName,
        flavors: this.state.flavorsSelected as number[],
        unitPrice: this.props.price,
        quantity: -1,
        totalPrice: -1,
      })
      this.setState({ ...this.state, showDropdown: false })
    } else {
      this.setState({ ...this.state, showDropdown: true })
    }
  }

  render() {
    return (
      <ProductDiv key={this.props.id} innerRef={(ref: any) => { this.parentRef = ref }}>
        <ProductContent
          onClick={this.handleProductClick}
          onDoubleClick={this.handleDoubleClick}
          isHighlighted={this.props.productSelected && this.props.productSelected.id === this.props.id}
        >
          <ProductContentName>{this.props.name}</ProductContentName>
          <ProductContentFlavors>
            {this.state.flavorsSelected.map((el, idx) =>
              <ProductContentFlavor key={idx}>
                {getFlavorName(this.props.allFlavors, el)}
              </ProductContentFlavor>
            )}
          </ProductContentFlavors>
          <ProductContentPrice>{convertToPriceFormat(this.props.price)}</ProductContentPrice>
        </ProductContent>

        {this.props.flavors.length === 0 ? null :
          !this.state.showDropdown ? null :
          <ProductFlavorPicker
            parentRef={this.parentRef}
            flavors={this.props.flavors}
            allFlavors={this.props.allFlavors}
            flavorsSelected={this.state.flavorsSelected}
            onSelectChange={this.handleSelectChange}
          />
        }
      </ProductDiv>
    )
  }
}
