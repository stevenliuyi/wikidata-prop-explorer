import React, { Component } from 'react'
import { Navbar, Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap'
import GoMarkGithub from 'react-icons/lib/go/mark-github'
import MdTranslate from 'react-icons/lib/md/translate'

class TopNavBar extends Component {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <span className="app-name">
              {this.props.translations.prop_explorer
                ? this.props.translations.prop_explorer
                : 'Wikidata Property Explorer'}
            </span>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem href="https://github.com/stevenliuyi/wikidata-prop-explorer">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="source">
                  {this.props.translations.source
                    ? this.props.translations.source
                    : 'source code'}
                </Tooltip>
              }
            >
              <GoMarkGithub size={18} />
            </OverlayTrigger>
          </NavItem>
          <NavItem>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="change-language">
                  {this.props.translations.language
                    ? this.props.translations.language
                    : 'change language'}
                </Tooltip>
              }
            >
              <span className="uls-trigger">
                <MdTranslate size={18} />
                <span className="uls-langname">English</span>
                <span className="uls-langcode">en</span>
              </span>
            </OverlayTrigger>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

export default TopNavBar
