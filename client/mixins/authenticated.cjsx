
# libs
React  = require 'react'
Router = require 'react-router'

# stores
User = require '../stores/user'

# mixins
Navigation = require '../mixins/navigation'

# mixin that will check user access before allowing
# a view to be shown
Authenticated =

  mixins : [
    Navigation 
    
  ]

  # prevent loading a view without being logged in
  componentWillMount: () ->
    @navigation.go '/login' unless User.authenticated
    # @context.router.replaceWith '/login' unless User.authenticated


module.exports = Authenticated