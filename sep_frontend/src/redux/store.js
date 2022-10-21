import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index";
import jwt_decode from "jwt-decode";

function saveToLocalStorage(state) {
  try {
    const localStorageState = JSON.stringify(state);
    localStorage.setItem("state", localStorageState);
  } catch (e) {
    console.log(e);
  }
}

function loadFromLocalStorage() {
  const localStorageState = localStorage.getItem("state");
  if (localStorageState === null) return undefined;
  return JSON.parse(localStorageState);
}

const plzRemoveTheToken = (store) => (next) => (action) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const decoded = token && jwt_decode(token).exp;
  if (token && decoded < Date.now() / 1000) {
    next(action);
    localStorage.clear();
  }
  next(action);
};

const storeFactory = () => {
  const middleware = [thunk, plzRemoveTheToken];
  const reduxStore = createStore(
    rootReducer,
    loadFromLocalStorage(),
    composeWithDevTools(
      applyMiddleware(...middleware)
      // other store enhancers if any
    )
  );
  reduxStore.subscribe(() => saveToLocalStorage(reduxStore.getState()));
  return reduxStore;
};

export default storeFactory;
