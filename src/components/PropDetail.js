import React, { Component } from 'react'
import { Table } from 'react-bootstrap'
import PropDetailRow from './PropDetailRow'

class PropDetail extends Component {
  render() {
    const blank = (
      <span className="prop-id" style={{ display: 'none' }}>
        {this.props.propId}
      </span>
    )
    if (!this.props.detailData[this.props.propId]) return blank
    const detailData = this.props.detailData[this.props.propId][
      this.props.language
    ]
    if (!detailData) return blank
    const onClassSelect = this.props.onClassSelect
    return (
      <div>
        {blank}
        <Table condensed={true} hover={true}>
          <tbody>
            {detailData.propClasses && (
              <PropDetailRow
                title="Instance of"
                content={detailData.propClasses.map((propClass, i) => (
                  <div key={`class-${i}`}>
                    <a
                      style={{ cursor: 'pointer' }}
                      onClick={() => onClassSelect(propClass)}
                    >
                      {detailData.propClassNames[i] !== ''
                        ? detailData.propClassNames[i]
                        : propClass}
                    </a>
                  </div>
                ))}
              />
            )}
            {detailData.subPropertyOf !== '' &&
              detailData.subPropertyOf != null && (
                <PropDetailRow
                  title="Subproperty of"
                  content={
                    <div>
                      <a
                        target="_blank"
                        href={`https://www.wikidata.org/entity/${
                          detailData.subPropertyOf
                        }`}
                      >
                        {detailData.subPropertyOfName !==
                        detailData.subPropertyOf
                          ? `${detailData.subPropertyOfName} (${
                              detailData.subPropertyOf
                            })`
                          : detailData.subPropertyOf}
                      </a>
                    </div>
                  }
                />
              )}
            {detailData.count >= 0 && (
              <PropDetailRow
                title="Uses"
                content={
                  <div>
                    <div>{detailData.count} statements</div>
                    <div>{detailData.qualifierCount} qualifiers</div>
                    <div>{detailData.refCount} references</div>
                  </div>
                }
              />
            )}
            {detailData.examples &&
              detailData.examples.length > 0 && (
                <PropDetailRow
                  title="Examples"
                  content={detailData.examples.map((example, i) => {
                    return (
                      <div key={`example-${i}`}>
                        <a
                          target="_blank"
                          href={`https://www.wikidata.org/entity/${example}#${
                            this.props.propId
                          }`}
                        >
                          {detailData.exampleLabels[i] !== example
                            ? `${detailData.exampleLabels[i]} (${example})`
                            : example}
                        </a>
                      </div>
                    )
                  })}
                />
              )}
            {detailData.seeAlsoes &&
              detailData.seeAlsoes.length > 0 && (
                <PropDetailRow
                  title="See also"
                  content={detailData.seeAlsoes.map((seeAlso, i) => {
                    return (
                      <div key={`see-also-${i}`}>
                        <a
                          target="_blank"
                          href={`https://www.wikidata.org/entity/${seeAlso}`}
                        >
                          {detailData.seeAlsoLabels[i] !== seeAlso
                            ? `${detailData.seeAlsoLabels[i]} (${seeAlso})`
                            : seeAlso}
                        </a>
                      </div>
                    )
                  })}
                />
              )}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default PropDetail
