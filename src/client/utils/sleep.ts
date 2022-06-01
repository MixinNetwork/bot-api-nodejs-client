export const sleep = (n = 500) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, n);
  });
