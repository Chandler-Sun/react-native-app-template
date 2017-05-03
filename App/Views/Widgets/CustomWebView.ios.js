import WKWebView from 'react-native-wkwebview-reborn';
import React, { Component,PropTypes } from 'react';
import I18n from 'react-native-i18n'

class CustomWebView extends Component {
  constructor(props) {
    super(props);
    this._webview = null
  }

  onWebViewMessage(message) {
    this.props.onMessage && this.props.onMessage(message.body)
  }

  postMessage(data) {
    this._webview.evaluateJavaScript('SkrapitNativeMessageHandler["'+ data.action + '"]('+JSON.stringify(data)+')')
  }

  render() {
    return (
    <WKWebView 
    ref={(ref) => { this._webview = ref }}
    {...this.props} 
    customUserAgent={this.props.userAgent} 
    onMessage={(message)=>{this.onWebViewMessage(message)}}
    />
    )
  }
}
export default CustomWebView