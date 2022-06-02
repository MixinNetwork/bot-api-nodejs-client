import axios from 'axios';

const MVMApiURI = 'https://mvm-api.test.mixinbots.com';

export const MVMApiClient = axios.create({
  baseURL: MVMApiURI,
});
