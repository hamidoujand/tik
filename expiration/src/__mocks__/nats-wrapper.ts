export let natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation((subject: string, data: string, cb: () => any) => {
        cb();
      }),
  },
};
