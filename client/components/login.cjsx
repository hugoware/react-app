
# libs
React = require 'react'

# stores
User = require '../stores/user'

# mixins
Navigation = require '../mixins/navigation'


# log into application view
Login = React.createClass
  name: 'Login'

  mixins : [
    Navigation
  ]

  getInitialState: () ->
    username: ''
    password: ''

  attempt_login: ( event ) ->
    event?.preventDefault?()

    User.authenticated = true
    @navigation.go '/'


  render: () ->
    <h3>Login</h3>
    <form onSubmit={@attempt_login}>
      <input type="text" onChange={@update_username} value={@state.username} />
      <input type="password" onChange={@update_password} value={@state.password} />
      <button type="submit" onClick={@attempt_login} >Login</button>
    </form>


module.exports = Login
