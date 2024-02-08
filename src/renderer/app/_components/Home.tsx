import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import BigMenu from './BigMenu/BigMenu';
import { saveCategoryThunk } from '../_actions';

const items = [
  { title: 'Categorías', id: 'categories', link: '/categories' },
  { title: 'Sabores', id: 'flavors', link: '/flavors' },
  { title: 'Productos', id: 'products', link: '/products' },
  { title: 'Recibos', id: 'receipts', link: '/receipts' },
  { title: 'Ajustes', id: 'settings', link: '/settings' },
  { title: 'Vender', id: 'sell', link: '/seller' }
];

interface Props {
  location: any,
  match: any,
  history: any,
}

class Home extends React.Component<Props> {
  handleBigMenuItemClick = (id: string) => {
    this.props.history.push(items.filter(el => el.id === id)[0].link)
  }

  render() {
    return (
      <BigMenu items={items} onItemClick={this.handleBigMenuItemClick} />
    )
  }
}

export default withRouter(Home)
