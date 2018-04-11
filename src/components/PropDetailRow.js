import React, { Component } from 'react'

class PropDetailRow extends Component {
  render() {
    return (
      <tr>
        <td width="30%">
          <span className="detail-title">{this.props.title}</span>
        </td>
        <td width="70%">{this.props.content}</td>
      </tr>
    )
  }
}

export default PropDetailRow
