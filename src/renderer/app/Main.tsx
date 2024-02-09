import React from 'react';
import { connect } from 'react-redux';
import { StoreState, View, views } from '../../schemas';
import Admin from './_components/Admin';
import Seller from './_components/Seller/Seller';
import Products from './_components/Products';
import Categories from './_components/Categories';
import Flavors from './_components/Flavors';
import Receipts from './_components/Receipts';
import Settings from './_components/Settings';
import { setView } from './_actions';

class Main extends React.Component<
  ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>
> {
  handleAdminItemClick = (id: string) => {
    const view = views.find((el) => el === id);
    if (view) this.props.setView(view);
  };

  goToAdminPage = () => {
    this.props.setView('admin');
  };

  render() {
    const view = this.props.view;

    return (
      <>
        {view === 'products' ? <Products /> : null}
        {view === 'categories' ? <Categories /> : null}
        {view === 'flavors' ? <Flavors /> : null}
        {view === 'receipts' ? <Receipts /> : null}

        {view === 'admin' ? (
          <Admin onItemClick={this.handleAdminItemClick} />
        ) : null}

        {view === 'seller' ? (
          <Seller onCorrectPassword={this.goToAdminPage} />
        ) : null}

        {view === 'settings' ? (
          <Settings onBackClick={this.goToAdminPage} />
        ) : null}
      </>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  view: state.view,
  notification: state.errorMessage,
  db: state.DB,
  isLoading: state.isGlobalLoading,
});

const mapDispatchToProps = (dispatch: any) => ({
  setView: (view: View) => dispatch(setView(view)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
