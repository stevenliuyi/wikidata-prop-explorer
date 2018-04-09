import React, { Component } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import { Grid, Row, Col } from 'react-bootstrap'
import * as WikidataAPI from '../utils/api'
import PropTree from './PropTree'
import PropTable from './PropTable'
import TopNavBar from './TopNavBar'
import ReactGA from 'react-ga'
import $ from 'jquery'

class App extends Component {
  state = {
    propTree: {},
    propList: [],
    currentPropId: '',
    toggleChecked: true,
    language: 'en'
  }

  addPropToTree = (tree, propId, propName, parentId) => {
    if (tree.qid === parentId) {
      if (tree.children == null) tree.children = []
      tree.children.push({
        name: propName,
        qid: propId
      })
    }
    if (tree.children != null) {
      tree.children.forEach(subtree => {
        this.addPropToTree(subtree, propId, propName, parentId)
      })
    }
  }

  getPropTree = data => {
    let propTree = {
      name: '',
      qid: 'Q18616576',
      toggled: true,
      children: []
    }

    data.forEach(prop => {
      const propId = prop.prop.value.substr(31)
      const propName = prop.name != null ? prop.name.value : ''
      const parentId = prop.parent.value.substr(31)
      if (propId === propTree.qid) propTree.name = propName
      this.addPropToTree(propTree, propId, propName, parentId)
    })

    this.setState({ propTree })
  }

  getPropList = data => {
    const propList = data.map(prop => {
      const propId = prop.prop.value.substr(31)
      const propLabel = prop.label != null ? prop.label.value : ''
      const propDescription = prop.desc != null ? prop.desc.value : ''
      const propType = prop.type.value.substr(26)
      return {
        propId,
        propLabel,
        propDescription,
        propType
      }
    })

    this.setState({ propList })
  }

  handleToggleChange = event => {
    this.setState({ toggleChecked: event.target.checked })
  }

  fetchPropTree = language => {
    const propTreeQueryFilename =
      process.env.NODE_ENV === 'development'
        ? `/queries/prop-tree-template.rq`
        : `${process.env.PUBLIC_URL}/queries/prop-tree-template.rq`

    fetch(propTreeQueryFilename)
      .then(res => res.text())
      .then(query_template => query_template.replace(/LANG_CODE/, language))
      .then(query =>
        WikidataAPI.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      )
      .then(data => {
        if (data === null) return
        this.getPropTree(data.results.bindings)
      })
  }

  componentWillMount() {
    this.fetchPropTree(this.state.language)
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextState.currentPropId !== this.state.currentPropId ||
      nextState.toggleChecked !== this.state.toggleChecked ||
      nextState.language !== this.state.language
    ) {
      const propListQueryFilename =
        process.env.NODE_ENV === 'development'
          ? `/queries/prop-template.rq`
          : `${process.env.PUBLIC_URL}/queries/prop-template.rq`

      fetch(propListQueryFilename)
        .then(res => res.text())
        .then(query_template => {
          let query = query_template
            .replace(/CLASS_ID/, nextState.currentPropId)
            .replace(/LANG_CODE/g, nextState.language)
          // don't show properties of sub-branches
          if (!nextState.toggleChecked)
            query = query.replace(/\/wdt:P279\*/, '')
          return query
        })
        .then(query =>
          WikidataAPI.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
        )
        .then(data => {
          if (data === null) return
          this.getPropList(data.results.bindings)
        })
    }

    if (nextState.language !== this.state.language) {
      this.fetchPropTree(nextState.language)
    }
  }

  componentDidMount() {
    // Google Analytics
    ReactGA.initialize('UA-117183010-1')
    ReactGA.pageview(window.location.pathname + window.location.search)

    $('.uls-langcode').on('DOMSubtreeModified', () => {
      const langcode = $('.uls-langcode').text()
      if (langcode !== '') this.setState({ language: langcode })
    })
  }

  render() {
    return (
      <div className="site">
        <div className="site-content">
          <TopNavBar />
          <Grid>
            <Row>
              <Col sm={4}>
                <PropTree
                  tree={this.state.propTree}
                  onChange={newId => this.setState({ currentPropId: newId })}
                  toggleChecked={this.state.toggleChecked}
                  handleToggleChange={this.handleToggleChange}
                  numOfResults={this.state.propList.length}
                />
              </Col>
              <Col sm={8}>
                <PropTable propList={this.state.propList} />
              </Col>
            </Row>
          </Grid>
        </div>
        <footer className="footer text-muted">
          Steven Liu&nbsp;&nbsp;2018
        </footer>
      </div>
    )
  }
}

export default App
