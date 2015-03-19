Docker microservice component for persistent incrementing. Capable of handling multiple simultaneous requests without collisions (i.e. no two requests should ever receive the same result because of timing).

##Usage
GET request increment by 1. POST requests increment by the number specified in the URL. PUT requests set the incrementer to the value specified in the URL. Namespace is optional.

Requires connection to redis. Currently uses default port, no password, `incrementer-redis` host. See the following .yml file for example configuration:

```yml
incrementer-api:
    image: shinymayhem/micro-incrementer
    ports:
        - "80"
    volumes_from:
        - incrementer-redis #for persistence after instance destroy
    links:
        - incrementer-redis #format- service:alias
incrementer-redis:
    image: tutum/redis
    ports:
        - "6379"
    environment:
        REDIS_PASS: "**None**"
        REDIS_APPENDONLY: yes
        REDIS_APPENDFSYNC: always
        #REDIS_APPENDFSYNC: everysec #for better performance
```

##Examples

Get new incremented number in default namespace

`GET /` returns 1

`GET /` returns 2

Get new incremented number in `myapp` namespace

`GET /myapp` returns 1

`GET /` returns 3

Get number after 200 increments to `myapp` namespace

`POST /myapp/200` returns 202

Set incrementer to 300. Next returned number will be 301

`PUT /myapp/300` returns {success: true}
`GET /myapp` returns 301
