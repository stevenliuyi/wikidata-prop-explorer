import React, { Component } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import ScrollToTop from 'react-scroll-up'
import MdArrowUpward from 'react-icons/lib/md/arrow-upward'
import { OverlayTrigger, Tooltip, Table } from 'react-bootstrap'
import $ from 'jquery'

class PropTable extends Component {
  state = {
    filtered: [],
    expanded: {},
    expandedProps: []
  }

  componentWillReceiveProps(nextProps, nextState) {
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
  }

  idSortMethod = (a, b, desc) => {
    const aValue = parseInt(a.substr(1), 10)
    const bValue = parseInt(b.substr(1), 10)
    if (aValue > bValue) return 1
    if (aValue < bValue) return -1
    return 0
  }

  subComponent = row => {
    const blank = (
      <span className="prop-id" style={{ display: 'none' }}>
        {row.row.propId}
      </span>
    )
    if (!this.props.detailData[row.row.propId]) return blank
    const detailData = this.props.detailData[row.row.propId][
      this.props.language
    ]
    if (!detailData) return blank
    const onClassSelect = this.props.onClassSelect
    return (
      <div>
        {blank}
        <Table condensed={true} hover={true}>
          <tbody>
            {detailData.propClasses.map((propClass, i) => (
              <tr>
                <td width="20%">
                  <span className="detail-title">
                    {i === 0 ? 'Instance of' : ''}
                  </span>
                </td>
                <td width="80%">
                  <a
                    style={{ cursor: 'pointer' }}
                    onClick={() => onClassSelect(propClass)}
                  >
                    {detailData.propClassNames[i] !== ''
                      ? detailData.propClassNames[i]
                      : propClass}
                  </a>
                </td>
              </tr>
            ))}
            <tr>
              <td width="20%">
                <span className="detail-title">Uses</span>
              </td>
              <td width="80%">{detailData.count}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    )
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

  render() {
    return (
      <div id="prop-table">
        <ReactTable
          data={this.props.propList}
          filterable
          filtered={this.state.filtered}
          columns={[
            {
              Header: 'ID',
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
              Header: 'Label',
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
              Header: 'Description',
              accessor: 'propDescription',
              style: { whiteSpace: 'normal' },
              minWidth: 150
            },
            {
              Header: 'Type',
              accessor: 'propType',
              width: 80
            }
          ]}
          SubComponent={this.subComponent}
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
          onFilteredChange={filtered => this.setState({ filtered })}
          onExpandedChange={newExpanded => {
            this.setState({
              expanded: newExpanded
            })
          }}
          noDataText={
            this.state.filtered.length === 0
              ? 'Select from the tree to show properties'
              : 'No properties found'
          }
        />
        <ScrollToTop showUnder={100}>
          <OverlayTrigger
            placement="left"
            overlay={<Tooltip id="back-to-top">back to top</Tooltip>}
          >
            <MdArrowUpward size={35} className="text-muted" />
          </OverlayTrigger>
        </ScrollToTop>
      </div>
    )
  }
}

export default PropTable
