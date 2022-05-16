import { Client } from '../src';
import fs from 'fs';
const keystore = JSON.parse(fs.readFileSync(__dirname + '/../config.json', 'utf8'));
const client = new Client(keystore);

export { client };
