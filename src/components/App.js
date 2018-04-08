import React, { Component } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import { Grid, Row, Col } from 'react-bootstrap'
import * as WikidataAPI from '../utils/api'
import PropTree from './PropTree'
import PropTable from './PropTable'
import TopNavBar from './TopNavBar'

class App extends Component {
  state = {
    propTree: {},
    propList: [],
    currentPropId: '',
    toggleChecked: true
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
      name: 'Wikidata property',
      qid: 'Q18616576',
      toggled: true,
      children: []
    }

    data.forEach(prop => {
      const propId = prop.prop.value.substr(31)
      const propName = prop.name != null ? prop.name.value : ''
      const parentId = prop.parent.value.substr(31)
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

  componentWillMount() {
    const propTreeQueryFilename =
      process.env.NODE_ENV === 'development'
        ? `/queries/prop-tree.rq`
        : `${process.env.PUBLIC_URL}/queries/prop-tree.rq`

    fetch(propTreeQueryFilename)
      .then(res => res.text())
      .then(query =>
        WikidataAPI.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      )
      .then(data => {
        if (data === null) return
        this.getPropTree(data.results.bindings)
      })
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextState.currentPropId !== this.state.currentPropId ||
      nextState.toggleChecked !== this.state.toggleChecked
    ) {
      const propListQueryFilename =
        process.env.NODE_ENV === 'development'
          ? `/queries/prop-template.rq`
          : `${process.env.PUBLIC_URL}/queries/prop-template.rq`

      fetch(propListQueryFilename)
        .then(res => res.text())
        .then(query_template => {
          let query = query_template.replace(
            /CLASS_ID/,
            nextState.currentPropId
          )
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
