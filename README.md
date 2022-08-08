# spark2json
Convert raw spark profiler data to JSON.

### usage (web)
If you're using the official spark viewer website, you can just append the `?raw=1` query parameter.
```
GET https://spark.lucko.me/abcdef?raw=1
```
:)

### usage (cli, docker)
```
docker run -it --rm ghcr.io/lucko/spark2json node cli.js <code>
```

### usage (cli, compile yourself)
```
yarn install
node src/cli.js <code>
```

### license
MIT