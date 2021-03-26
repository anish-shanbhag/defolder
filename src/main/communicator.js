// maybe in the future make a "stream" method which acts like getFolderSizes

function client({ receiver, send }) {
  const resolvers = {};
  receiver.on("message", ({ type, count, result }) => {
    resolvers[type][count](result);
    delete resolvers[type][count];
  });
  return {
    emit: (type, data) => send({ type, data }),
    invoke(type, data) {
      if (!resolvers[type]) resolvers[type] = [];
      send({ type, count: resolvers[type].length, data });
      return new Promise(resolve => resolvers[type].push(resolve));
    }
  }
}

function server({ receiver, send, handlers }) {
  receiver.on("message", async ({ type, count, data }) => {
    const result = await handlers[type](data);
    if (result !== undefined) {
      send({ type, count, result });
    }
  });
}

module.exports = { client, server };