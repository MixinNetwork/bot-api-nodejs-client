import { MixinApi } from '../src';
import keystore from './keystore';

const config = {
  requestConfig: {
    responseCallback: (err: any) => {
      console.log(err);
    },
  },
  keystore,
};
const client = MixinApi(config);

const app_pin = '9b1b3b1006de4881a6f3c1a8da462444dc3950c76b42d3579a88d4d68bae74be';

export { client, keystore, app_pin };
