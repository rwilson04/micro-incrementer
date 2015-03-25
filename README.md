Docker microservice component for persistent incrementing. Capable of handling multiple simultaneous requests without collisions (i.e. no two requests should ever receive the same result because of timing).

##Usage
GET request increment by 1. POST requests increment by the number specified in the URL. PUT requests set the incrementer to the value specified in the URL. Namespace is optional.

If AUTOBACKUP is set to true, a GET request will be sent to http://persistence/data every time an operation completes successfully. This can be useful if you want to copy the /data volume to an external source.

Requires connection to redis. Currently uses default port, no password, `incrementer-redis` host. See the following .yml file for example configuration:

```yml
web:
    #this web app simply sends GET requests to http://increment to get the collision-safe incrementing number, starting at 1
    image: some/web/app
    links:
        - incrementer-api:increment
incrementer-api:
    image: shinymayhem/micro-incrementer
    environment:
        AUTOBACKUP: true
    links:
        - incrementer-persistence:persistence #optional
        - incrementer-redis
incrementer-redis:
    image: tutum/redis
    ports:
        - "6379"
    environment:
        REDIS_PASS: "**None**"
        REDIS_APPENDONLY: yes
        REDIS_APPENDFSYNC: always
        #REDIS_APPENDFSYNC: everysec #for better performance
#optional
incrementer-persistence:
    image: shinymayhem/micro-s3-persistence
    environment:
        S3_BUCKET_NAME: bucket.example.com
        AWS_ACCESS_KEY_ID: something
        AWS_SECRET_ACCESS_KEY: something
        AWS_DEFAULT_REGION: us-east-2
        compress: false
    volumes_from:
        - incrementer-redis

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
