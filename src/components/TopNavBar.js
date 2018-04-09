import React, { Component } from 'react'
import { Navbar, Nav, NavItem } from 'react-bootstrap'
import GoMarkGithub from 'react-icons/lib/go/mark-github'
import MdTranslate from 'react-icons/lib/md/translate'

class TopNavBar extends Component {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <span className="app-name">Wikidata Property Explorer</span>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem href="https://github.com/stevenliuyi/wikidata-prop-explorer">
            <GoMarkGithub size={18} />
          </NavItem>
          <NavItem>
            <span className="uls-trigger">
              <MdTranslate size={18} />
              <span className="uls-langname">English</span>
              <span className="uls-langcode">en</span>
            </span>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

export default TopNavBar
