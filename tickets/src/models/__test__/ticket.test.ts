import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  let ticket = Ticket.build({ title: "concert", price: 120, userId: "asdf" });
  await ticket.save();

  let firstFetch = await Ticket.findById(ticket.id);
  let secondFetch = await Ticket.findById(ticket.id);

  //update the first one
  firstFetch!.set({ price: 123 });
  await firstFetch!.save();

  //now try to update the second one

  try {
    secondFetch!.set({ price: 321 });
    await secondFetch!.save();
  } catch (err) {
    expect(err).toBeDefined();
    return;
  }
});

it("should increment the version number", async () => {
  let ticket = Ticket.build({ title: "concert", price: 120, userId: "asdf" });
  await ticket.save();

  let fetchedTicket = await Ticket.findById(ticket.id);

  //update the first one
  fetchedTicket!.set({ price: 123 });
  await fetchedTicket!.save();

  expect(fetchedTicket!.version).toEqual(1);
});
