import React, { Component } from 'react'

class About extends Component {
    render() {
        return (
            <div className="text-muted">
                <h2>
                    <span className="app-name">
                        {this.props.translations.prop_explorer ? (
                            this.props.translations.prop_explorer
                        ) : (
                            'Wikidata Property Explorer'
                        )}
                    </span>
                </h2>
                <p>
                    This tool aims to provide an easy way to browse and filter the tree of Wikidata properties. All the
                    data are extracted using the <a href="https://query.wikidata.org/">Wikidata Query Service</a>.
                </p>
                <p>
                    If you'd like to help on interface translations, please visit{' '}
                    <a href="https://tooltranslate.toolforge.org//#tool=32">Tool Translate</a>.
                </p>
                <p>
                    The source code is available on{' '}
                    <a href="https://github.com/stevenliuyi/wikidata-prop-explorer">Github</a>. If you encounter any
                    problem, you can contact me on Github or{' '}
                    <a href="https://www.wikidata.org/wiki/User:Stevenliuyi">Wikidata</a>.
                </p>
                <p>
                    The tool is based on a suggestion from <a href="https://www.wikidata.org/wiki/User:Micru">Micru</a>.
                </p>
            </div>
        )
    }
}

export default About
