server = require './server'

# file resources
server.file '/', 'client/index.html'

# start the server
server.listen 4000

