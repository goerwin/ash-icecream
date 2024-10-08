import React from 'react';
import ReactDom from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { webFrame } from 'electron';
import reduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';
import reducers from './_reducers';
import { StoreState } from '../../schemas';
import 'reset-css';
import './app.scss';
import Main from './Main';

// Prevent zomming in the page with pinch gesture/shortcuts
webFrame.setVisualZoomLevelLimits(1, 1);

const initialDB: StoreState['DB'] = {
  CATEGORIES: [],
  CATEGORIES_BIGGEST_ID: 0,
  FLAVORS: [],
  FLAVORS_BIGGEST_ID: 0,
  PRODUCTS: [],
  PRODUCTS_BIGGEST_ID: 0,
  pw: '1234',
  RECEIPTS: [],
  RECEIPTS_BIGGEST_ID: 0,
};

Promise.resolve(initialDB).then((db) => {
  const initialState: StoreState = {
    DB: db,
    view: 'admin',
    isGlobalLoading: false,
    errorMessage: '',
  };

  const store = createStore(
    // @ts-ignore
    reducers,
    initialState,
    applyMiddleware(reduxThunk)
  );

  ReactDom.render(
    <Provider store={store}>
      <MuiThemeProvider>
        <Main />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
});
