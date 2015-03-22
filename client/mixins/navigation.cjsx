
# libs
React  = require 'react'
Router = require 'react-router'


# Ensures routing is available
Navigation = 

  contextTypes:
    router : React.PropTypes.func.isRequired
      
  # consistent navigation experience
  componentWillMount: () ->
    @navigation = 

      # standard navigation
      go : ( path ) =>
        @context.router.replaceWith path


module.exports = Navigation