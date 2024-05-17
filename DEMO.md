# API Testing with Grafana k6

To initialise a minimal k6 script:

```shell
docker run --rm -i -v ${PWD}:/app -w /app docker.io/grafana/k6:0.51.0 new
```

The command will create a file named [`script.js`](./script.js).

## Generate Test Script from OpenAPI Specs

TBD.

## References

- [Running k6 | Grafana k6 documentation](https://grafana.com/docs/k6/v0.51.x/get-started/running-k6/)
- [Load Testing Your API with Swaggear/OpenAPI and k6](https://k6.io/blog/load-testing-your-api-with-swagger-openapi-and-k6/)
