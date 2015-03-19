Docker microservice for persistent incrementing

##Usage
Get new incremented number in default namespace

`GET /`

Get new incremented number in `myapp` namespace

`GET /myapp`

Get number after 200 increments to `myapp` namespace

`POST /myapp/200`

Set incrementer to 300. Next returned number will be 301

`PUT /myapp/300`
