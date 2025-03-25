const { MixinApi } = require('../dist');

const main = async () => {
  const url =
    'https://mixin.one/pay/MINAAAjAgICFJ4rl_85SKOyVF61rP1FStO-4jqB1EYukCoi2unvif8CbkgvwojeRRWr4UUrEd6-Z2YVLAszVTjvnsXK6X4pRyoKMC4wMDAwMDAwMQAJZXh0cmEgb25lAI7oV9hB2EfktLEwsvTmHQmWXlxuQ0w_qbeAxQ9DzZVcCjAuMDAwMDAwMDEACWV4dHJhIHR3bwEBAFguXmU';
  const client = MixinApi();
  const resp = await client.code.schemes(url);
  console.log(`https://mixin.one/schemes/${resp.scheme_id}`);
};

main();
