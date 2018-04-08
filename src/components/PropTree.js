import React, { Component } from 'react'
import { Treebeard } from 'react-treebeard'
import treeStyle from '../utils/tree'

class PropTree extends Component {
  state = {}

  componentWillMount() {
    this.onToggle = this.onToggle.bind(this)
  }

  onToggle(node, toggled) {
    const { cursor } = this.state

    if (cursor) {
      cursor.active = false
    }

    node.active = true
    if (node.children) {
      node.toggled = toggled
    }
    this.setState({ cursor: node })

    this.props.onChange(node.qid)
  }

  render() {
    return (
      <Treebeard
        data={this.props.tree}
        onToggle={this.onToggle}
        style={treeStyle}
      />
    )
  }
}

export default PropTree
