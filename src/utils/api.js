// fetch SPARQL results from Wikidata
export const fetchSPARQLResult = (sparql) =>
    fetch(`https://query.wikidata.org/sparql?${sparql}&format=json`)
        .then((res) => {
            return res.status >= 400 ? null : res.json()
        })
        .catch((err) => {
            console.log(err)
            return null
        })

// fetch translations
export const fetchToolTranslations = (lang) =>
    fetch(
        process.env.PUBLIC_URL === '/prop-explorer' // on wmflabs
            ? `https://tooltranslate.toolforge.org/data/prop-explorer/${lang}.json`
            : `https://cors-anywhere.herokuapp.com/https://tooltranslate.toolforge.org/data/prop-explorer/${lang}.json`
    ).then((res) => {
        return res.status >= 400 ? {} : res.json()
    })
