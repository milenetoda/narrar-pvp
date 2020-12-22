"use strict";

const Path = require("path");
const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/favicon.ico",
    handler: () => "",
  });

  await server.register(require("@hapi/h2o2"));
  server.route({
    method: "GET",
    path: "/proxy/{path*}",
    handler: {
      proxy: {
        mapUri: function (request) {
          return {
            uri: "https://assets.thesilphroad.com/" + request.params.path,
          };
        },
        passThrough: true,
        xforward: true,
      },
    },
  });

  await server.register(require("@hapi/inert"));
  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        index: ["index.html"],
        path: Path.join(__dirname, "pages"),
      },
    },
  });

  await server.register(require("./modules/scraper"));

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
