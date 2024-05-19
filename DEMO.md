# API Testing with Grafana k6

To initialise a minimal k6 script:

```shell
docker run --rm -i -v ${PWD}:/app -w /app docker.io/grafana/k6:0.51.0 new
```

The command creates a file named [`script.js`](./script.js) in the project directory.
The file itself provides a basic structure for writing a test script using k6 with some explanation comments.

## Write API Functional Test

First, let's start by looking at the common structure of a k6 test script:

```js
// From: https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/
// 1. init code

export function setup() {
  // 2. setup code
}

export default function (data) {
  // 3. VU code
}

export function teardown(data) {
  // 4. teardown code
}
```

A k6 test script is written as a single module JavaScript.
The script has four sections:

1. Init -> initialises test script, executed **once per VU** (Virtual User, or "Thread" in JMeter-speak)
2. Setup -> initialises shared data shared across VUs, **executed once**
3. VU Code -> runs the test script on each VU
4. Teardown -> cleans up the test environment

> Note: To clarify difference of Init and Setup,
> the Init code runs once on every VU spawned by k6.
> Meanwhile, the Setup code only runs once.
> For example, if a test script spawns 5 VUs,
> then the Init code will be run 5 times (once per VU)
> and the Setup code will be run 1 time.

For more detailed explanation of the sections,
please refer to ["Test lifecycle" documentation](https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#overview-of-the-lifecycle-stages).

Let's see an example of functional test at [`src/test/k6/functional_test_pettypes.js`](./src/test/k6/functional_test_pettypes.js).

```js
// Omitted for brevity
// ...
export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,

  // A string specifying the total duration of the test run.
  // duration: '3s',

  // A number specifying the number of times to run the test script in a VU .
  iterations: 1,
}

export default function() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let url = `${BASE_URL}/petclinic/api/pettypes`;
  
  group('01. Create a new Pet Type', () => {
    const response = http.post(url, JSON.stringify({
      name: 'civet',
    }), params);
    
    if (check(response, { 'Pet Type is created': (r) => r.status === 201 })) {
      url = `${BASE_URL}/petclinic/api/pettypes/${response.json('id')}`;
    } else {
      fail(`Unable to create a new Pet Type ${response.status} ${response.body}`);
    }
  })
  // Ommited for brevity
  // ...
}
```

## References

- [Running k6 | Grafana k6 documentation](https://grafana.com/docs/k6/v0.51.x/get-started/running-k6/)
- [Load Testing Your API with Swaggear/OpenAPI and k6](https://k6.io/blog/load-testing-your-api-with-swagger-openapi-and-k6/)
