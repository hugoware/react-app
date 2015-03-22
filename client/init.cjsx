
# libs
React  = require 'react'
Router = require 'react-router'
RouteHandler = Router.RouteHandler

# router stuff
Route        = Router.Route
DefaultRoute = Router.DefaultRoute
Link         = Router.Link

# components
App        = require './components/app'
Login      = require './components/login'
Lists      = require './components/lists'
ListEditor = require './components/list-editor'

# application routes
routes = 
  <Route handler={App}>
    <DefaultRoute handler={Lists} />
    <Route handler={Login} path='login' />
    <Route handler={ListEditor} path='list/:list' />
  </Route>


# initialize
Router.run routes, ( Handler ) ->
  React.render <Handler/>, document.body