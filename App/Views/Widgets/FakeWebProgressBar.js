import React, { Component, PropTypes} from 'react'
import {View} from 'react-native'
import ProgressBar from './ProgressBar'

export default class FakeWebProgressBar extends Component {
  static propTypes = {
    animated: PropTypes.bool,
    borderColor: PropTypes.string,
    borderRadius: PropTypes.number,
    borderWidth: PropTypes.number,
    children: PropTypes.node,
    color: PropTypes.string,
    height: PropTypes.number,
    indeterminate: PropTypes.bool,
    progress: PropTypes.number,
    style: View.propTypes.style,
    unfilledColor: PropTypes.string,
    width: PropTypes.number,
    intervalSecond: PropTypes.number,
  };

  static defaultProps = {
    progress: 0,
    intervalSecond: 0.2
  };

  constructor(props) {
    super(props);
    this.state = {
      progress: props.progress
    };

    this._interval = null
    this._timeout = null
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    this.clear()
  }

  componentWillReceiveProps(props) {
    if (props.progress) {
      this.setState({progress})
    }
  }

  startLoading() {
    let x = 0
    this._interval && clearInterval(this._interval)
    this._interval = setInterval(() => {
        x += (Math.min(Math.PI/2 - 0.2, Math.PI/2 - 0.2 - x)) / 30
        this.setState({progress: Math.sin(x)})
      }, this.props.intervalSecond * 1000 )
  }

  finishLoading() {
    this._interval && clearInterval(this._interval)
    this.setState({progress: 0.99})
    this._timeout = setTimeout(()=>{
      this.setState({progress: 0})
    }, 0.4 * 1000)
  }

  clear() {
    console.tron.log('timmer clearing')
    this._interval && clearInterval(this._interval)
    this._timeout && clearTimeout(this._timeout)
  }

  render() {
    if (this.state.progress <= 0 || this.state.progress >= 1) {
      return (<View/>)
    } else {
      const { progress, ...restProps} = this.props
      return (
        <ProgressBar progress={this.state.progress} {...restProps}/>
      )
    }
  }
}