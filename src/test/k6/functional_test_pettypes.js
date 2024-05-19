import http from 'k6/http';
import { check, fail, group } from 'k6';
import { BASE_URL } from './common.js';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 1,

  // A string specifying the total duration of the test run.
  // duration: '3s',

  // A number specifying the number of times to run the test script in a VU .
  iterations: 1,
}

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
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
  
  group(`02. Delete the new Pet Type`, () => {
    const response = http.del(url, null, params);
    
    const isSuccessfulDelete = check(response, { 'Pet Type is deleted': (r) => r.status === 204 });
    
    if (!isSuccessfulDelete) {
      fail('Unable to delete the new Pet Type' + url);
    }

    url = `${BASE_URL}/petclinic/api/pettypes`;
  })
  
  group(`03. Get all Pet Types`, () => {
    const response = http.get(url, null, params);
    
    const isSuccessfulGet = check(response, { 'Pet Types are retrieved': (r) => r.status === 200 });
  })
}
