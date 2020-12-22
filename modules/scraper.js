"use strict";

var Xray = require("x-ray");
var x = Xray({
  filters: {
    trim: function (value) {
      return typeof value === "string" ? value.trim() : value;
    },
    slice: function (value, start, end) {
      return typeof value === "string" ? value.slice(start, end) : value;
    },
    isShadow(value) {
      return typeof value === "string" ? value.includes("shadow") : value;
    },
    getWidth: function (value) {
      if (typeof value !== "string") {
        return value;
      }

      const startStr = "width:";
      const startIdx = value.indexOf(startStr);
      if (startIdx === -1) {
        return value;
      }

      const endStr = ";";
      const endIdx = value.indexOf(endStr, startIdx);
      if (endIdx === -1) {
        return value;
      }

      return value.slice(startIdx + startStr.length, endIdx).trim();
    },
    fixUrl: function (value) {
      if (typeof value !== "string") {
        return value;
      }
      var x = value
        .replace("https://thesilphroad.com/", "/proxy/")
        .replace("https://assets.thesilphroad.com/", "/proxy/");

      return x;
    },
  },
});

module.exports = {
  name: __filename,
  register: async function (server, options) {
    server.route({
      method: "GET",
      path: "/scrape",
      handler: function (request, h) {
        const url = request.query.url;

        return x(url, "#checkedIn tr[data-participant]", [
          {
            team: ".teamLogo@src| fixUrl",
            avatar: ".avatarWrap img@src| fixUrl",
            username: ".competitorUsername | trim",
            tier: {
              name:
                ".player-tier div:not(.competitorUsername):not(.avatarWrap)| trim",
              level:
                ".player-tier div:not(.competitorUsername):not(.avatarWrap) :nth-child(2)@style | getWidth",
            },
            pokemon: x(".pokemonEntry", [
              {
                avatar: "img@src| fixUrl",
                cp: "p.cp",
                name: "p:not(.cp)",
                shadow: "@class | isShadow",
              },
            ]),
          },
        ]);
      },
    });
  },
};
