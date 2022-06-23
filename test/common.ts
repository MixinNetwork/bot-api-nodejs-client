import { MixinApi } from '../src';
import keystore from './keystore';

const config = {
  requestConfig: {
    responseCallback: (err: any) => {
      console.log(err);
    }
  },
  keystore
};
const client = MixinApi(config);

export {
  client ,
  keystore
};
