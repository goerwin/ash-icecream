import React from 'react';
import ReactDom from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { webFrame } from 'electron';
import reduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';

import reducers from './_reducers';
import { StoreState } from '../../_helpers/models';
import * as api from './_api';
import 'reset-css';
import './app.scss';
import Main from './Main';

// Prevent zomming in the page with pinch gesture/shortcuts
webFrame.setVisualZoomLevelLimits(1, 1);

Promise.all([api.getProducts(), api.getCategories(), api.getFlavors()]).then(
  ([products, categories, flavors]) => {
    const initialState: StoreState = {
      view: 'admin',
      products,
      categories,
      flavors,
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
  }
);
