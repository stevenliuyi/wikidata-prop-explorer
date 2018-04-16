import React, { Component } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import ScrollToTop from 'react-scroll-up'
import MdArrowUpward from 'react-icons/lib/md/arrow-upward'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import $ from 'jquery'
import PropDetail from './PropDetail'
import Multiselect from 'react-bootstrap-multiselect'
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css'
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu'

class PropTable extends Component {
  state = {
    filtered: [],
    expanded: {},
    expandedProps: [],
    typeList: [
      { value: 'CommonsMedia', selected: true },
      { value: 'ExternalId', selected: true },
      { value: 'GeoShape', selected: true },
      { value: 'GlobeCoordinate', selected: true },
      { value: 'Monolingualtext', selected: true },
      { value: 'Quantity', selected: true },
      { value: 'String', selected: true },
      { value: 'TabularData', selected: true },
      { value: 'Time', selected: true },
      { value: 'Url', selected: true },
      { value: 'WikibaseItem', selected: true },
      { value: 'WikibaseProperty', selected: true }
    ],
    typeText: ''
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentPropClassId !== this.props.currentPropClassId ||
      nextProps.language !== this.props.language ||
      nextProps.toggleChecked !== this.props.toggleChecked
    )
      this.setState({ expanded: {} })
  }

  componentDidUpdate() {
    const newExpandedProps = $('.prop-id')
      .toArray()
      .map(p => p.innerText)
    let currentPropId = this.props.currentPropId
    newExpandedProps.forEach(p => {
      if (!this.state.expandedProps.includes(p)) currentPropId = p
    })
    if (currentPropId !== this.props.currentPropId)
      this.props.onExpand(currentPropId)
    if (newExpandedProps.toString() !== this.state.expandedProps.toString())
      this.setState({
        expandedProps: newExpandedProps
      })

    // update text if new language is chosen
    const options = this.state.typeList.filter(t => t.selected)
    const firstOptionText = options.length !== 0 ? options[0].value : ''
    const typeText = this.getTypeText(options.length, firstOptionText)
    $('.multiselect-selected-text')
      .first()
      .text(typeText)
  }

  idSortMethod = (a, b, desc) => {
    const aValue = parseInt(a.substr(1), 10)
    const bValue = parseInt(b.substr(1), 10)
    if (aValue > bValue) return 1
    if (aValue < bValue) return -1
    return 0
  }

  labelFilterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id
    let values = [
      row[id][0].toLowerCase(),
      ...row[id][1].split(' | ').map(a => a.toLowerCase())
    ]
    if (row[id] == null) values = ''
    const filterValue = filter.value.toLowerCase()
    return values.some(v => v.includes(filterValue))
  }

  typeFilterMethod = (filter, row) => {
    if (filter.value === 'none') return false
    const id = filter.pivotId || filter.id
    return filter.value.split(',').includes(row[id])
  }

  handleTypeChange = (onChange, typeList = null) => {
    const selected =
      typeList == null
        ? // directly select from type list
          this.select.$multiselect.val()
        : // select from context menu
          typeList.filter(t => t.selected).map(t => t.value)
    // sync state
    this.setState({
      typeList: this.state.typeList.map(type => ({
        ...type,
        selected: selected.includes(type.value)
      }))
    })
    let selectedString = selected.join(',')
    selectedString = selectedString !== '' ? selectedString : 'none'
    onChange(selectedString)
  }

  handleMenuClick = (e, data, target) => {
    let newTypeList = {}
    if (data.mode === 'all') {
      newTypeList = this.state.typeList.map(type => ({
        ...type,
        selected: true
      }))
    } else if (data.mode === 'none') {
      newTypeList = this.state.typeList.map(type => ({
        ...type,
        selected: false
      }))
    } else if (data.mode === 'inverse') {
      newTypeList = this.state.typeList.map(type => ({
        ...type,
        selected: !type.selected
      }))
    }
    this.setState({ typeList: newTypeList })
    this.select.syncData()
    this.select.props.onChange({ typeList: newTypeList })
  }

  typeFilterComponent = ({ filter, onChange }) => (
    <div>
      <ContextMenuTrigger id="type-menu" holdToDisplay={500}>
        <Multiselect
          ref={s => (this.select = s)}
          buttonClass="btn btn-default btn-sm btn-type"
          data={this.state.typeList}
          onChange={({ typeList }) => this.handleTypeChange(onChange, typeList)}
          maxHeight={150}
          buttonText={(options, select) => {
            const typeText = this.getTypeText(
              options.length,
              $(options)
                .first()
                .text()
            )
            this.setState({ typeText })
            return typeText
          }}
          multiple
        />
      </ContextMenuTrigger>
    </div>
  )

  getTypeText = (optionsLength, firstOptionText) => {
    let typeText = ''
    if (optionsLength === this.state.typeList.length) {
      typeText = this.props.translations.type_all
        ? this.props.translations.type_all
        : 'All'
    } else if (optionsLength === 1) {
      typeText = firstOptionText
    } else if (optionsLength === 0) {
      typeText = this.props.translations.type_none
        ? this.props.translations.type_none
        : 'None'
    } else {
      typeText = (this.props.translations.type_num
        ? this.props.translations.type_num
        : '$1 types'
      ).replace(/\$1/, optionsLength)
    }

    return typeText
  }

  render() {
    return (
      <div id="prop-table">
        <ReactTable
          data={this.props.propList}
          filterable
          filtered={this.state.filtered}
          columns={[
            {
              Header: this.props.translations.id
                ? this.props.translations.id
                : 'ID',
              accessor: 'propId',
              Cell: row => (
                <div>
                  <a
                    target="_blank"
                    href={`https://www.wikidata.org/entity/${row.value}`}
                  >
                    {row.value}
                  </a>
                </div>
              ),
              sortMethod: this.idSortMethod,
              width: 80
            },
            {
              Header: this.props.translations.label
                ? this.props.translations.label
                : 'Label',
              id: 'propLabel',
              accessor: d => [d.propLabel, d.propAliases],
              Cell: row => (
                <div>
                  {row.value[0]}
                  <br />
                  {row.value[1] !== '' && (
                    <span
                      className="text-muted"
                      style={{ fontSize: 'smaller' }}
                    >
                      {row.value[1]}
                    </span>
                  )}
                </div>
              ),
              filterMethod: this.labelFilterMethod,
              style: { whiteSpace: 'normal' },
              minWidth: 100
            },
            {
              Header: this.props.translations.description
                ? this.props.translations.description
                : 'Description',
              accessor: 'propDescription',
              style: { whiteSpace: 'normal' },
              minWidth: 150
            },
            {
              Header: this.props.translations.type
                ? this.props.translations.type
                : 'Type',
              accessor: 'propType',
              width: 120,
              Filter: this.typeFilterComponent,
              filterMethod: this.typeFilterMethod
            }
          ]}
          SubComponent={row => (
            <PropDetail propId={row.row.propId} {...this.props} />
          )}
          expanded={this.state.expanded}
          pageSize={
            this.props.propList.length !== 0
              ? Math.min(this.props.propList.length, 100)
              : 5
          }
          showPageSizeOptions={false}
          showPagination={this.props.propList.length > 100}
          defaultFilterMethod={(filter, row) => {
            const id = filter.pivotId || filter.id
            let value = row[id].toLowerCase()
            if (row[id] == null) value = ''
            const filterValue = filter.value.toLowerCase()
            return value.includes(filterValue)
          }}
          onFilteredChange={filtered => {
            this.setState({ filtered, expanded: {} })
          }}
          onSortedChange={() => this.setState({ expanded: {} })}
          onPageChange={() => this.setState({ expanded: {} })}
          onExpandedChange={newExpanded => {
            this.setState({
              expanded: newExpanded
            })
          }}
          noDataText={
            this.state.filtered.length === 0
              ? this.props.translations.select_tree
                ? this.props.translations.select_tree
                : 'Select from the tree to show properties'
              : this.props.translations.no_properties
                ? this.props.translations.no_properties
                : 'No properties found'
          }
          getTheadFilterThProps={() => {
            // fix multiselect display issue
            return {
              style: { overflow: 'inherit' }
            }
          }}
        />
        <ScrollToTop showUnder={100}>
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip id="back-to-top">
                {this.props.translations.back_to_top
                  ? this.props.translations.back_to_top
                  : 'back to top'}
              </Tooltip>
            }
          >
            <MdArrowUpward size={35} className="text-muted" />
          </OverlayTrigger>
        </ScrollToTop>
        <ContextMenu id="type-menu">
          <MenuItem data={{ mode: 'all' }} onClick={this.handleMenuClick}>
            {this.props.translations.select_all
              ? this.props.translations.select_all
              : 'Select all'}
          </MenuItem>
          <MenuItem data={{ mode: 'none' }} onClick={this.handleMenuClick}>
            {this.props.translations.select_none
              ? this.props.translations.select_none
              : 'Select none'}
          </MenuItem>
          <MenuItem data={{ mode: 'inverse' }} onClick={this.handleMenuClick}>
            {this.props.translations.select_inverse
              ? this.props.translations.select_inverse
              : 'Select inverse'}
          </MenuItem>
        </ContextMenu>
      </div>
    )
  }
}

export default PropTable
