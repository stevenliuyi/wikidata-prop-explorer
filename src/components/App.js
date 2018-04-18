import React, { Component } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import { Grid, Row, Col } from 'react-bootstrap'
import * as API from '../utils/api'
import PropTree from './PropTree'
import PropTable from './PropTable'
import TopNavBar from './TopNavBar'
import About from './About'
import ReactGA from 'react-ga'
import $ from 'jquery'

class App extends Component {
  state = {
    propTree: {},
    propList: [],
    currentPropClassId: '',
    currentPropId: '',
    toggleChecked: true,
    language: 'en',
    propDetailData: {},
    translations: {},
    show_about: false
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
      const propAliases = prop.aliases != null ? prop.aliases.value : ''
      return {
        propId,
        propLabel,
        propDescription,
        propType,
        propAliases
      }
    })

    this.setState({ propList })
  }

  getPropDetail = (data, language) => {
    const propId = data[0].prop.value.substr(31)
    const propClasses = data[0].classes.value.split(' ').map(c => c.substr(31))
    const propClassNames = data[0].classNames.value.split('|')
    const count = parseInt(data[0].count.value, 10)
    const qualifierCount = parseInt(data[0].qualifierCount.value, 10)
    const refCount = parseInt(data[0].refCount.value, 10)
    const instruction = data[0].instruction ? data[0].instruction.value : ''
    const subPropertyOf = data[0].subPropertyOf
      ? data[0].subPropertyOf.value.substr(31)
      : ''
    const subPropertyOfName = data[0].subPropertyOfName
      ? data[0].subPropertyOfName.value
      : ''

    this.setState({
      propDetailData: {
        ...this.state.propDetailData,
        [propId]: {
          ...this.state.propDetailData[propId],
          [language]: {
            ...(this.state.propDetailData[propId]
              ? this.state.propDetailData[propId][language]
              : {}),
            propClasses,
            propClassNames,
            count,
            qualifierCount,
            refCount,
            instruction,
            subPropertyOf,
            subPropertyOfName
          }
        }
      }
    })
  }

  getPropSeeAlso = (data, language, propId) => {
    let seeAlsoes = []
    let seeAlsoLabels = []
    data.forEach(e => {
      seeAlsoes.push(e.seeAlso.value.substr(31))
      seeAlsoLabels.push(e.seeAlsoLabel.value)
    })

    this.setState({
      propDetailData: {
        ...this.state.propDetailData,
        [propId]: {
          ...this.state.propDetailData[propId],
          [language]: {
            ...(this.state.propDetailData[propId]
              ? this.state.propDetailData[propId][language]
              : {}),
            seeAlsoes,
            seeAlsoLabels
          }
        }
      }
    })
  }

  getPropExamples = (data, language, propId) => {
    let examples = []
    let exampleLabels = []
    data.forEach(e => {
      examples.push(e.example.value.substr(31))
      exampleLabels.push(e.exampleLabel.value)
    })

    this.setState({
      propDetailData: {
        ...this.state.propDetailData,
        [propId]: {
          ...this.state.propDetailData[propId],
          [language]: {
            ...(this.state.propDetailData[propId]
              ? this.state.propDetailData[propId][language]
              : {}),
            examples,
            exampleLabels
          }
        }
      }
    })
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
        API.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      )
      .then(data => {
        if (data === null) return
        this.getPropTree(data.results.bindings)
      })
  }

  fetchPropDetail = (id, language) => {
    const propDetailQueryFilename =
      process.env.NODE_ENV === 'development'
        ? `/queries/prop-detail-template.rq`
        : `${process.env.PUBLIC_URL}/queries/prop-detail-template.rq`

    fetch(propDetailQueryFilename)
      .then(res => res.text())
      .then(query_template => query_template.replace(/PROP_ID/g, id))
      .then(query_template => query_template.replace(/LANG_CODE/g, language))
      .then(query =>
        API.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      )
      .then(data => {
        if (data === null) return
        this.getPropDetail(data.results.bindings, language)
      })

    const propExampleQueryFilename =
      process.env.NODE_ENV === 'development'
        ? `/queries/prop-example-template.rq`
        : `${process.env.PUBLIC_URL}/queries/prop-example-template.rq`

    fetch(propExampleQueryFilename)
      .then(res => res.text())
      .then(query_template => query_template.replace(/PROP_ID/, id))
      .then(query_template => query_template.replace(/LANG_CODE/, language))
      .then(query => {
        return API.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      })
      .then(data => {
        if (data === null) return
        this.getPropExamples(data.results.bindings, language, id)
      })

    const propSeeAlsoQueryFilename =
      process.env.NODE_ENV === 'development'
        ? `/queries/prop-seealso-template.rq`
        : `${process.env.PUBLIC_URL}/queries/prop-seealso-template.rq`

    fetch(propSeeAlsoQueryFilename)
      .then(res => res.text())
      .then(query_template => query_template.replace(/PROP_ID/, id))
      .then(query_template => query_template.replace(/LANG_CODE/, language))
      .then(query => {
        return API.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
      })
      .then(data => {
        if (data === null) return
        this.getPropSeeAlso(data.results.bindings, language, id)
      })
  }

  getTranslations = language => {
    API.fetchToolTranslations(language).then(res =>
      this.setState({ translations: res })
    )
  }

  componentWillMount() {
    this.fetchPropTree(this.state.language)
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      nextState.currentPropClassId !== this.state.currentPropClassId ||
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
            .replace(/CLASS_ID/, nextState.currentPropClassId)
            .replace(/LANG_CODE/g, nextState.language)
          // don't show properties of sub-branches
          if (!nextState.toggleChecked)
            query = query.replace(/\/wdt:P279\*/, '')
          return query
        })
        .then(query =>
          API.fetchSPARQLResult(`query=${encodeURIComponent(query)}`)
        )
        .then(data => {
          if (data === null) return
          this.getPropList(data.results.bindings)
        })
    }

    if (nextState.language !== this.state.language) {
      this.fetchPropTree(nextState.language)
      this.getTranslations(nextState.language)
    }

    if (
      nextState.currentPropId !== this.state.currentPropId ||
      nextState.language !== this.state.language
    ) {
      const propDetail = nextState.propDetailData[nextState.currentPropId]
      if (propDetail == null || propDetail[nextState.language] == null)
        this.fetchPropDetail(nextState.currentPropId, nextState.language)
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
          <TopNavBar
            translations={this.state.translations}
            handleTabSelect={s => this.setState({ show_about: s })}
          />
          <Grid>
            <div className={this.state.show_about ? 'hide' : ''}>
              <Row>
                <Col sm={4} className="tree">
                  <PropTree
                    ref="tree"
                    tree={this.state.propTree}
                    currentPropClassId={this.state.currentPropClassId}
                    onChange={newId =>
                      this.setState({ currentPropClassId: newId })
                    }
                    toggleChecked={this.state.toggleChecked}
                    handleToggleChange={this.handleToggleChange}
                    numOfResults={this.state.propList.length}
                    translations={this.state.translations}
                  />
                </Col>
                <Col sm={8}>
                  <PropTable
                    propList={this.state.propList}
                    detailData={this.state.propDetailData}
                    language={this.state.language}
                    currentPropClassId={this.state.currentPropClassId}
                    toggleChecked={this.state.toggleChecked}
                    onExpand={newId => this.setState({ currentPropId: newId })}
                    onClassSelect={newId => {
                      this.setState({ currentPropClassId: newId })
                      this.refs.tree.updateTree(newId)
                    }}
                    translations={this.state.translations}
                  />
                </Col>
              </Row>
            </div>
            <div className={this.state.show_about ? '' : 'hide'}>
              <Row>
                <Col sm={3} />
                <Col sm={6}>
                  <About translations={this.state.translations} />
                </Col>
                <Col sm={3} />
              </Row>
            </div>
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
