import React, { Component } from 'react'
import { Treebeard } from 'react-treebeard'
import { FormControl } from 'react-bootstrap'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
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

  componentWillReceiveProps(nextProps, nextState) {
    if (
      Object.keys(this.state.tree).length === 0 ||
      nextProps.tree.name !== this.props.tree.name
    )
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
        <div className="clearfix" style={{ marginBottom: '5px' }}>
          <div className="pull-right">
            <span style={{ marginRight: '5px', fontSize: '8pt' }}>
              Show properties in sub-branches
            </span>
            <Toggle
              checked={this.props.toggleChecked}
              onChange={this.props.handleToggleChange}
              className="prop-toggle"
            />
          </div>
        </div>
        <div style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
          <Treebeard
            data={this.state.tree}
            onToggle={this.onToggle}
            style={treeStyle}
          />
        </div>
      </div>
    )
  }
}

export default PropTree
