export let natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation((subject: string, data: string, cb: () => any) => {
        cb();
      }),
  },
};

// export let natsWrapper = {
//   client: {
//     publish: (subject: string, data: string, cb: () => any) => {
//       cb();
//     },
//   },
// };
