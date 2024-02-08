import React from 'react';
import ReactDom from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { webFrame } from 'electron';
import reduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';

import reducers from './_reducers';
import { Product, Category, StoreState } from './_models';
import * as api from './_api';
import Seller from './_components/Seller/Seller';
import Home from './_components/Home';
import Products from './_components/Products';
import Categories from './_components/Categories';
import Flavors from './_components/Flavors';
import Receipts from './_components/Receipts';
import Settings from './_components/Settings';
import 'reset-css';
import './app.scss';

// Prevent zomming in the page with pinch gesture/shortcuts
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(0, 0)

Promise.all([
  api.getProducts(),
  api.getCategories(),
  api.getFlavors(),
])
  .then(([products, categories, flavors]) => {
    const initialState: StoreState = {
      products,
      categories,
      flavors,
      isGlobalLoading: false,
      errorMessage: '',
    }

    // @ts-ignore
    const store = createStore(reducers, initialState, applyMiddleware(reduxThunk));

    ReactDom.render(
      <Provider store={store}>
        <Router initialEntries={['/seller']} initialIndex={0}>
          <MuiThemeProvider>
            <>
              <Route exact path='/' component={Home}/>
              <Route path='/seller' component={Seller}/>
              <Route path='/products' component={Products}/>
              <Route path='/categories' component={Categories}/>
              <Route path='/flavors' component={Flavors}/>
              <Route path='/receipts' component={Receipts}/>
              <Route path='/settings' component={Settings}/>
            </>
          </MuiThemeProvider>
        </Router>
      </Provider>,
      document.getElementById('app')
    );
  })
