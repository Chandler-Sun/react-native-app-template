import React, { Component,PropTypes } from 'react';
import { TabBarBottom } from "react-navigation";
import { connect } from 'react-redux';
import {Settings} from 'react-native'
import AppActions from '../../State/App'
import {KEY_LAST_HOME_TAB_INDEX} from '../../Config/UserSettings'

class SKTabBarBottom extends Component{
  constructor(props) {
    super(props)
  }
  _jumpToIndex(index){
    this.props.updateSettings(KEY_LAST_HOME_TAB_INDEX, index)
    Settings.set({homeViewTabIndex: index})
    this.props.jumpToIndex && this.props.jumpToIndex(index)
  }
  render(){
    return (
      <TabBarBottom 
      {...this.props}
      jumpToIndex={this._jumpToIndex.bind(this)}
      />
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.app.settings|| {}
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateSettings: (key, value)=>{
      dispatch(AppActions.updateSettings(key, value))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SKTabBarBottom)