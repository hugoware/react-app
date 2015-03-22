
# libs
React = require 'react'

# mixins
Authenticated = require '../mixins/authenticated'


# view to show the list of lists
Lists = React.createClass
  name: 'Lists'

  mixins: [
    Authenticated
  ]

  render: () ->
    <h3>Lists</h3>


module.exports = Lists
