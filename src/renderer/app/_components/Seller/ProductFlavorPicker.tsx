import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { SelectField, MenuItem } from 'material-ui'

import { Product, Flavor } from '../../_models'

const ProductSelectFlavorContainer = styled.div`
  position: absolute;
  background: #fff;
  box-shadow: 0 0 15px #000;
  z-index: 2000;
  border-radius: 10px;
  width: 270px;
  padding: 10px 0 0 10px;
`

interface Props {
  allFlavors: Flavor[],
  flavors: Product['flavors'],
  flavorsSelected: (Flavor['id'] | null)[],
  parentRef: any,
  onSelectChange: (idx: number, value: any) => void,
}

const containerEl = document.createElement('div')
document.body.appendChild(containerEl);

var cumulativeOffset = function(element: HTMLElement) {
  let { top, left } = element.getBoundingClientRect()
  return { top: top, left: left + element.clientWidth + 10 }
}

export function getFlavorName(allFlavors: Flavor[], flavorId: Flavor['id'] | null) {
  const flavor = allFlavors.find(el => el.id === flavorId)
  return flavor ? flavor.name : '-'
}

export default class ProductFlavorPicker extends React.Component<Props> {
  el = document.createElement('div');

  componentDidMount() {
    containerEl.appendChild(this.el);
  }

  componentWillUnmount() {
    containerEl.removeChild(this.el);
  }

  render() {
    return createPortal(
      <ProductSelectFlavorContainer style={cumulativeOffset(this.props.parentRef)}>
        {this.props.flavors.map((el, idx) =>
          <SelectField
            key={idx}
            hintText={`Sabor ${idx + 1}`}
            value={this.props.flavorsSelected[idx]}
            onChange={(a, b, value) => {
              this.props.onSelectChange(idx, value)
            }}
          >
            {el.flavorOptions.map(el2 =>
              <MenuItem
                checked={this.props.flavorsSelected[idx] === el2}
                value={el2}
                key={el2}
                primaryText={getFlavorName(this.props.allFlavors, el2)}
              />
            )}
          </SelectField>
        )}
      </ProductSelectFlavorContainer>,
      this.el
    )
  }
}
