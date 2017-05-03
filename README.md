# react-native-app-template
A react-native app template with some basic components integrated.
## Components

### Important components used in this app:

Basics:
* [apisauce](https://github.com/skellock/apisauce): API wrapper
* [moment-timezone](http://momentjs.com/timezone/docs/): Handy time related processing tools
* [native-base](http://nativebase.io/): UI library based on react native built-in components.
* [react-native-view-shot](https://github.com/gre/react-native-view-shot): save react native view as image.
* [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n): i18n support.
* [react-native-vector-icons](https://oblador.github.io/react-native-vector-icons/): Icons/Logos library.

[Redux](http://redux.js.org/docs/introduction/) related:
* [react-native-router-flux](https://github.com/aksonov/react-native-router-flux): React Native Router based on new React Native Navigation API
* [seamless-immutable](https://github.com/rtfeldman/seamless-immutable): Helpers for creating immutable objects/arrays (readonly). In Redux, immutable data for state transition is strongly recommended to make sure the app's behaviours are more predictable.
* [reduxsauce](https://github.com/skellock/reduxsauce): Helpers for creating Types/Actions/Reducers in Redux.
* [redux-logger](https://github.com/evgenyrodionov/redux-logger): Redux middleware for action logging (prev state->action->next state).
* [redux-persist](https://github.com/rt2zz/redux-persist): State persistent package for Redux. (i.e. save state to local storage)

The Saga Pattern: [Pager](http://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf)
* [redux-saga](https://redux-saga.github.io/redux-saga/): a redux middleware that handles Saga *side effect* (i.e. asynchronous things like data fetching and impure things like accessing the browser cache) in Redux applications. Works as a middleware of Redux so we have to connect it to the Redux Store. **Because reducers should be pure functions, all the side effects (API calls) should be performed before the action has been dispatched and the pure function has been executed.**

[Reactotron](https://github.com/reactotron/reactotron) related:
(A desktop app for inspecting your React JS and React Native projects.)

* reactotron-react-native: Reactotron is a tool that helps log/debug/state inspect of the app remotely. This package is a tool to integrate React Native with Reactotron.
* reactotron-redux: To monitor Redux actions/state changes automatically with Reactrotron.
* reactotron-redux-saga: To monitor saga actions automatically with Reactotron.
* reactotron-apisauce: To monitor apisauce requests/response automatically with Reactrotron.

Testing:
* [Jest](https://facebook.github.io/jest/): Jest is a JavaScript testing framework, used by Facebook to test all JavaScript code including React applications.

For more information of packages, please check package.json
