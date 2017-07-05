import {WebView} from 'react-native';
import React, { Component,PropTypes } from 'react';
import I18n from 'react-native-i18n'

class CustomWebView extends Component {
  constructor(props) {
    super(props);
  }

  onWebViewMessage(message) {
    this.props.onMessage && this.props.onMessage(message.nativeEvent.data)
  }

  postMessage(data) {
    this._webview.postMessage(JSON.stringify(data))
  }
  
  render() {
    return (
    <WebView 
    ref={(ref) => { this._webview = ref }}
    {...this.props} 
    onMessage={(message)=>{this.onWebViewMessage(message)}}/>
    )
  }
}

export default CustomWebView