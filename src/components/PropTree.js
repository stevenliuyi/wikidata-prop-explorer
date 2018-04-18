import React, { Component } from 'react'
import { Treebeard, decorators } from 'react-treebeard'
import { FormControl } from 'react-bootstrap'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import treeStyle from '../utils/tree'
import * as filters from '../utils/filter'
import $ from 'jquery'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu'

// check if an element is in the view of a scrollable container
// reference: https://stackoverflow.com/questions/16308037/detect-when-elements-within-a-scrollable-div-are-out-of-view
function checkInView(elem, partial) {
  var container = $('#treebread')
  var contHeight = container.height()
  //var contTop = container.scrollTop()
  //var contBottom = contTop + contHeight

  var elemTop = $(elem).offset().top - container.offset().top
  var elemBottom = elemTop + $(elem).height()

  var isTotal = elemTop >= 0 && elemBottom <= contHeight
  var isPart =
    ((elemTop < 0 && elemBottom > 0) ||
      (elemTop > 0 && elemTop <= container.height())) &&
    partial

  return isTotal || isPart
}

class PropTree extends Component {
  state = {
    filterText: '',
    tree: {},
    decorators: {},
    scroll: false
  }

  componentDidUpdate() {
    // expand region for triggering customized context menu
    $('.tree')
      .find('li')
      .each(function() {
        $(this)
          .children()
          .first()
          .css('display', 'flex')
        $(this)
          .children()
          .first()
          .children()
          .last()
          .css('flex-grow', '100')
      })

    setTimeout(() => {
      if (
        this.props.currentPropClassId &&
        !checkInView(`#class-${this.props.currentPropClassId}`, false)
      ) {
        $('#treebread').animate(
          {
            scrollTop:
              $(`#class-${this.props.currentPropClassId}`).offset().top -
              $('#treebread').offset().top +
              $('#treebread').scrollTop()
          },
          0
        )
      }
    }, 200)
  }

  componentWillMount() {
    this.onToggle = this.onToggle.bind(this)
    this.onFilterChange = this.onFilterChange.bind(this)
    this.updateTree = this.updateTree.bind(this)

    decorators.Header = ({ style, node }) => {
      return (
        <div style={style.base}>
          <ContextMenuTrigger id="context-menu" holdToDisplay={1000}>
            <div
              id={`class-${node.qid}`}
              className="unselectable"
              style={style.title}
              dangerouslySetInnerHTML={{
                __html: node.name
              }}
            />
            <div
              style={{ display: 'none' }}
              dangerouslySetInnerHTML={{
                __html: node.qid
              }}
            />
          </ContextMenuTrigger>
        </div>
      )
    }

    decorators.Toggle = ({ style }) => {
      return (
        <div style={style.base}>
          <div
            style={{
              ...style.wrapper,
              height: style.height,
              width: style.width
            }}
          >
            <span className="tree-expander" />
          </div>
        </div>
      )
    }

    this.setState({ decorators })
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (
      Object.keys(this.state.tree).length === 0 ||
      nextProps.tree.name !== this.props.tree.name
    )
      this.setState({ tree: nextProps.tree })
  }

  // set nodes with specified ID active
  setActiveId(node, id) {
    node.active = node.qid === id ? true : false
    let children = node.children
    if (children && children.length > 0)
      children.forEach(child => this.setActiveId(child, id))
  }

  onToggle(node, toggled) {
    const { tree } = this.state
    // set all nodes inactive
    this.setActiveId(tree, null)

    node.active = true
    if (node.children) {
      node.toggled = toggled
    }

    this.props.onChange(node.qid)
  }

  onFilterChange(e) {
    const filterText = e.target.value
    const filterRe = new RegExp(filterText, 'ig')

    if (!filterText) return this.setState({ tree: this.props.tree, filterText })

    let filtered = filters.filterTree(this.props.tree, filterText)
    filtered = filters.expandFilteredNodes(filtered, filterText)
    filtered = filters.highlightMatchedTexts(filtered, filterText, filterRe)
    this.setState({ tree: filtered, filterText })
  }

  // update tree when a property class is selected from the table
  updateTree(classId) {
    let tree = this.props.tree
    tree = filters.expandFilteredNodes(tree, classId, filters.idMatcher, true)
    this.setActiveId(tree, classId)
    this.setState({ tree, scroll: true })
  }

  handleMenuClick(e, data, target) {
    window.open(
      `https://www.wikidata.org/entity/${$(target)
        .children()
        .last()
        .text()}`,
      '_blank'
    )
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          <FormControl
            type="text"
            value={this.state.filterText}
            placeholder={
              this.props.translations.tree_search
                ? this.props.translations.tree_search
                : 'Search the tree...'
            }
            onChange={this.onFilterChange}
          />
        </div>
        <div className="clearfix" style={{ marginBottom: '5px' }}>
          <div className="pull-right">
            <span style={{ marginRight: '5px', fontSize: '8pt' }}>
              {this.props.translations.subbranch_toggle
                ? this.props.translations.subbranch_toggle
                : 'Show properties in sub-branches'}
            </span>
            <Toggle
              checked={this.props.toggleChecked}
              onChange={this.props.handleToggleChange}
              className="prop-toggle"
            />
          </div>
        </div>
        <div
          id="treebread"
          style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}
        >
          <Treebeard
            data={this.state.tree}
            onToggle={this.onToggle}
            style={treeStyle}
            decorators={this.state.decorators}
          />
        </div>
        <div className="text-muted pull-right" style={{ paddingTop: '3px' }}>
          {this.props.numOfResults
            ? (this.props.translations.num_properties
                ? this.props.translations.num_properties
                : '$1 properties found'
              ).replace(/\$1/, this.props.numOfResults)
            : ''}
        </div>
        <ContextMenu id="context-menu">
          <MenuItem onClick={this.handleMenuClick}>
            {this.props.translations.open_in_wd
              ? this.props.translations.open_in_wd
              : 'Open link on Wikidata'}
          </MenuItem>
        </ContextMenu>
      </div>
    )
  }
}

export default PropTree
