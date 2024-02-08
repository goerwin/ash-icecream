import React from 'react';
import BigMenu from './BigMenu/BigMenu';

const items = [
  { title: 'Categorías', id: 'categories', link: '/categories' },
  { title: 'Sabores', id: 'flavors', link: '/flavors' },
  { title: 'Productos', id: 'products', link: '/products' },
  { title: 'Recibos', id: 'receipts', link: '/receipts' },
  { title: 'Ajustes', id: 'settings', link: '/settings' },
  { title: 'Vender', id: 'seller', link: '/seller' }
];

type Props =  {
  onItemClick: (id: string) => void;
}

export default class Admin extends React.Component<Props> {
  render() {
    return (
      <BigMenu items={items} onItemClick={this.props.onItemClick} />
    )
  }
}
