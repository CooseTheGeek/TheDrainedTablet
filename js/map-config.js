// map-config.js – DRAINED TABLET ULTIMATE v7.0.0
// Map configuration for The Drained Land's 3X Monthly.
// Includes anchors for coordinate conversion.

const MAP_CONFIG = {
  id: "drained-lands",
  name: "The Drained Land's 3X Monthly",
  apiServerId: "drained-lands",
  map: {
    imageUrl: "/maps/drained-lands-10325.png",
    worldSize: 3500,
    measured: { w: 1325, h: 1059 },
    anchors: [
      { worldX: -1019, worldZ: -1170, pixelX: 392, pixelY: 786 },
      { worldX: 1138, worldZ: 1377, pixelX: 965, pixelY: 109 },
      { worldX: 0,    worldZ: 0,     pixelX: 663, pixelY: 476 },
    ],
  },
};

window.MAP_CONFIG = MAP_CONFIG;