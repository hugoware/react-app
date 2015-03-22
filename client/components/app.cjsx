
# libs
React  = require 'react'
Router = require 'react-router'

# routing
RouteHandler = Router.RouteHandler

# main application
App = React.createClass

  render: () ->

    <div>
      <header>App</header>
      <RouteHandler />
    </div>

module.exports = App