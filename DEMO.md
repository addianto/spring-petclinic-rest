# API Testing with Grafana k6

To initialise a minimal k6 script:

```shell
docker run --rm -i -v ${PWD}:/app -w /app docker.io/grafana/k6:0.51.0 new
```

The command will create a file named [`script.js`](./script.js).

## References

- [Running k6 | Grafana k6 documentation](https://grafana.com/docs/k6/v0.51.x/get-started/running-k6/)
