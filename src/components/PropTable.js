import React, { Component } from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class PropTable extends Component {
  render() {
    return (
      <div id="prop-table">
        <ReactTable
          data={this.props.propList}
          filterable
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
              )
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
          noDataText="Select from the tree to show properties"
        />
      </div>
    )
  }
}

export default PropTable
