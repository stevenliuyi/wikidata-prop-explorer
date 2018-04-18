// Helper functions for filtering
// reference: https://github.com/alexcurtis/react-treebeard/blob/master/example/filter.js

export const defaultMatcher = (filterText, node) => {
  return node.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1
}
export const idMatcher = (filterId, node) => {
  return node.qid === filterId
}

export const findNode = (node, filter, matcher) => {
  return (
    matcher(filter, node) || // i match
    (node.children && // or i have decendents and one of them match
      node.children.length &&
      !!node.children.find(child => findNode(child, filter, matcher)))
  )
}

export const filterTree = (node, filter, matcher = defaultMatcher) => {
  // If im an exact match then all my children get to stay
  if (matcher(filter, node) || !node.children) {
    return node
  }
  // If not then only keep the ones that match or have matching descendants
  const filtered = node.children
    .filter(child => findNode(child, filter, matcher))
    .map(child => filterTree(child, filter, matcher))
  return Object.assign({}, node, { children: filtered })
}

export const expandFilteredNodes = (
  node,
  filter,
  matcher = defaultMatcher,
  showUnmatched = false
) => {
  let children = node.children
  if (!children || children.length === 0) {
    return Object.assign({}, node, { toggled: false })
  }
  const childrenWithMatches = node.children.filter(child =>
    findNode(child, filter, matcher)
  )
  const shouldExpand = childrenWithMatches.length > 0
  // If im going to expand, go through all the matches and see if thier children need to expand
  if (shouldExpand) {
    children = (showUnmatched ? children : childrenWithMatches).map(child => {
      return expandFilteredNodes(child, filter, matcher)
    })
  }
  return Object.assign({}, node, {
    children: children,
    toggled: shouldExpand
  })
}

// add class to highlight matched texts
export const highlightMatchedTexts = (node, filter, re) => {
  node.name =
    node.name && filter !== ''
      ? node.name.replace(
          re,
          match => `<span class="match-text">${match}</span>`
        )
      : node.name
  let children = node.children
  if (!children || children.length === 0) {
    return Object.assign({}, node)
  }

  children = children.map(child => {
    return highlightMatchedTexts(child, filter, re)
  })
  return Object.assign({}, node, {
    children: children
  })
}
