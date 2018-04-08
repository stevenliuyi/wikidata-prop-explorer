import React, { Component } from 'react'
import { Treebeard } from 'react-treebeard'
import { FormControl } from 'react-bootstrap'
import treeStyle from '../utils/tree'
import * as filters from '../utils/filter'

class PropTree extends Component {
  state = {
    filterText: '',
    tree: {}
  }

  componentWillMount() {
    this.onToggle = this.onToggle.bind(this)
    this.onFilterChange = this.onFilterChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(this.state.tree).length === 0)
      this.setState({ tree: nextProps.tree })
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

  onFilterChange(e) {
    const filterText = e.target.value
    if (!filterText) return this.setState({ tree: this.props.tree, filterText })

    let filtered = filters.filterTree(this.props.tree, filterText)
    filtered = filters.expandFilteredNodes(filtered, filterText)
    this.setState({ tree: filtered, filterText })
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          <FormControl
            type="text"
            value={this.state.filterText}
            placeholder="Search the tree..."
            onChange={this.onFilterChange}
          />
        </div>
        <Treebeard
          data={this.state.tree}
          onToggle={this.onToggle}
          style={treeStyle}
        />
      </div>
    )
  }
}

export default PropTree
