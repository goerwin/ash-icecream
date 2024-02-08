import { combineReducers } from 'redux';
import { StoreState } from './_models';
import { Actions, Action } from './_actions';

export default function reducers(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case Actions.SET_CATEGORIES: {
      return { ...state, categories: action.payload }
    }
    case Actions.SET_PRODUCTS: {
      return { ...state, products: action.payload }
    }
    case Actions.SET_GLOBAL_LOADING: {
      return { ...state, isGlobalLoading: action.payload }
    }
    case Actions.SET_ERROR_MESSAGE: {
      return { ...state, errorMessage: action.payload }
    }
    case Actions.SET_FLAVORS: {
      return { ...state, flavors: action.payload }
    }
  }

  // Redux does an initial action (@@redux/INIT) so the switch isn't enough
  // https://github.com/reduxjs/redux/issues/382#issuecomment-126719658
  return state;

}
