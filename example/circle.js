const { MixinApi, hashMembers } = require('..');

const keystore = {
  user_id: '045d0919-2990-41d6-8176-b7041b6e9ef9',
  pin: '762887',
  client_id: '045d0919-2990-41d6-8176-b7041b6e9ef9',
  session_id: '83c99c8c-7bab-40bc-86c0-ef25f455d710',
  pin_token: 'ExWPCknlmSz1TFS3Ic-BcHAEtAfaGl5U6pP9IMgPPwk',
  private_key: 'HW9G427uk9_yQYZ4qhJKLsMjGani-sN00KYTavEF00Lk1ls6zMihUpOc7HCb9UIQAkNgoIhXCbae3NRLZ1OwHQ',
};
const client = MixinApi({
  keystore,
  requestConfig: {
    responseCallback: err => {
      console.log(err);
    },
  },
});

const main = async () => {
  const members = ['7766b24c-1a03-4c3a-83a3-b4358266875d', 'd53acaa9-6e20-4e35-9cf8-3ea25186e235', keystore.client_id, '34a6bb5c-4547-4852-9504-02e31edfb2b8'];
  const conversation_id = hashMembers(members);
  const circle = await client.circle.fetchList();
  console.log(circle);
};

main();

// const res1 = await client.circle.fetchList();
// console.log(res1);
// const res2 = await client.circle.conversations(res1[0].circle_id);
// console.log(res2);
// const res3 = await client.conversation.fetch(res2[0].conversation_id);
// console.log(res3);
