# API Testing with Grafana k6

## Prerequisites

Prepare the following tools:

- [Grafana k6](https://github.com/grafana/k6/releases)
  - The provided test script examples are written and tested using k6 version 0.50.0.
- (optional) A JavaScript package manager, e.g., `npm`, `pnpm`
  - It is required for installing type definitions of `k6` JavaScript module to improve IntelliSense (code completion) on a text editor.
  - To install: `npm install --save-dev @types/k6`

Verify `k6` is installed:

```shell
$ k6 --version
k6.exe v0.50.0 (commit/f18209a5e3, go1.21.8, windows/amd64)
```

## Minimal k6 Script

To initialise a minimal k6 script:

```shell
k6 new
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

A k6 test script is written as a single JavaScript module.
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

The `options` defines the configuration for the test script.
In this example, the `options` specifies to only run 1 VU
and each VU will run the test code once.
It is also possible to specify the test duration,
but it is not relevant to the example above.
The test duration will be useful if we are developing a load test script instead of functional test script.

The next section is a function that will be executed by a VU.
It follows closely to the common test structure.
In the example, we use `group` function to encapsulate a test case.

Inside a `group`, it sets up the test code by defining the parameters of the HTTP call to the target API and the URL.
Next, it exercises the target API by sending a request.
Then, it verifies the response and check if it matches the expected HTTP status.

## Run a k6 Script

To run a k6 script:

```shell
k6 run ./src/test/k6/functional_test_pettypes.js
```

The output should be similar to:

```shell

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

     execution: local
        script: .\src\test\k6\functional_test_pettypes.js
        output: -

     scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
              * default: 1 iterations shared among 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


     █ 01. Create a new Pet Type

       ✓ Pet Type is created

     █ 02. Delete the new Pet Type

       ✓ Pet Type is deleted

     █ 03. Get all Pet Types

       ✓ Pet Types are retrieved

// Omitted for brevity ...
```

To produce a summary of the test result in JSON format, run the test script with `--summary-export [JSON file]` option:

```shell
k6 run --summary-export summary.json ./src/test/k6/functional_test_pettypes.js
```

The resulting summary file should look similar to:

```json
{
    "root_group": {
        "path": "",
        "id": "d41d8cd98f00b204e9800998ecf8427e",
        "groups": {
            "01. Create a new Pet Type": {
                "groups": {},
                "checks": {
                        "Pet Type is created": {
                            "name": "Pet Type is created",
                            "path": "::01. Create a new Pet Type::Pet Type is created",
                            "id": "4b905cec469d331d49349eefab8ac411",
                            "passes": 1,
                            "fails": 0
                        }
                    },
                "name": "01. Create a new Pet Type",
                "path": "::01. Create a new Pet Type",
                "id": "59560014ad9349a9cd515f51ca4d666e"
            },
            // Omitted for brevity
        }
        // Omitted for brevity
    }
    // Omitted for brevity
}
```

## References

- [Running k6 | Grafana k6 documentation](https://grafana.com/docs/k6/v0.51.x/get-started/running-k6/)
- [Load Testing Your API with Swaggear/OpenAPI and k6](https://k6.io/blog/load-testing-your-api-with-swagger-openapi-and-k6/)
