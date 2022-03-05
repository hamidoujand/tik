export let stripe = {
  charges: {
    create: jest.fn().mockReturnValue({ id: "asdf" }),
  },
};
