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

const app_pin = 'ca82b9f1f4b8f17800a2b47b30f071ec7bef7e20f7672678c4003f846d984de0';

export { client, keystore, app_pin };
