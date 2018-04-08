import React, { Component } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import ScrollToTop from 'react-scroll-up'
import MdArrowUpward from 'react-icons/lib/md/arrow-upward'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

class PropTable extends Component {
  state = {
    filtered: []
  }

  idSortMethod = (a, b, desc) => {
    const aValue = parseInt(a.substr(1), 10)
    const bValue = parseInt(b.substr(1), 10)
    if (aValue > bValue) return 1
    if (aValue < bValue) return -1
    return 0
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
              width: 100
            },
            {
              Header: 'Label',
              accessor: 'propLabel'
            },
            {
              Header: 'Description',
              accessor: 'propDescription'
            },
            {
              Header: 'Type',
              accessor: 'propType'
            }
          ]}
          pageSize={
            this.props.propList.length !== 0
              ? Math.min(this.props.propList.length, 200)
              : 5
          }
          showPageSizeOptions={false}
          showPagination={this.props.propList.length > 200}
          defaultFilterMethod={(filter, row) => {
            const id = filter.pivotId || filter.id
            let value = row[id].toLowerCase()
            if (row[id] == null) value = ''
            const filterValue = filter.value.toLowerCase()
            return value.includes(filterValue)
          }}
          onFilteredChange={filtered => this.setState({ filtered })}
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
