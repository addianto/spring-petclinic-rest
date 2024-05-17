import http from 'k6/http';
import { check } from 'k6';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,
  // A string specifying the total duration of the test run.
  duration: '3s',
}

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
//
export default function() {
  const url = 'http://admin:admin@localhost:9966/petclinic/api/pettypes/1';

  const params = {
    auth: 'basic',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(url, params);

  check(response, {
    'is status 200': (r) => r.status === 200,
  });
}
