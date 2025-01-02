document.addEventListener("DOMContentLoaded", () => {
  const btnImport = document.getElementById("btnImport");
  const btnRandomize = document.getElementById("btnRandomize");
  const chkBlendModes = document.getElementById("chkBlendModes");
  const chkRotation = document.getElementById("chkRotation");
  const chkScale = document.getElementById("chkScale");
  const chkPosition = document.getElementById("chkPosition");

  const blendModes = [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "colorDodge",
    "colorBurn",
    "hardLight",
    "softLight",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ];

  btnImport.addEventListener("click", async () => {
    try {
      const fs = require("uxp").storage.localFileSystem;
      const app = require("photoshop").app;
      const core = require("photoshop").core;

      const files = await fs.getFileForOpening({
        allowMultiple: true,
        types: ["jpg", "jpeg", "png", "webp"],
      });

      if (!files || files.length === 0) return;

      await core.executeAsModal(
        async () => {
          const targetDoc = app.activeDocument;
          for (const file of files) {
            const tempDoc = await app.open(file);
            
            // Explicitly set the canvas size to match the target document
            await tempDoc.resizeCanvas(targetDoc.width, targetDoc.height);
            
            console.log(`Temporary document width set to: ${tempDoc.width}`);
            console.log(`Temporary document height set to: ${tempDoc.height}`);
            await tempDoc.activeLayers[0].duplicate(targetDoc);

            await tempDoc.closeWithoutSaving();
          }
        },
        { commandName: "Import Images as Layers" }
      );
    } catch (err) {
      console.error("Error importing images:", err);
    }
  });

  btnRandomize.addEventListener("click", async () => {
    try {
      const app = require("photoshop").app;
      const core = require("photoshop").core;

      await core.executeAsModal(
        async () => {
          const doc = app.activeDocument;
          const layers = doc.layers;

          console.log(`Starting to randomize layers in document: ${doc.name}`);

          for (const layer of layers) {
            if (layer.locked || layer.kind === "artboard") continue;

            console.log(`Processing layer: ${layer.name}`);
            console.log(`Current blend mode: ${layer.blendMode}`);

            if (chkBlendModes.checked) {
              const randomBlendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
              layer.blendMode = randomBlendMode;
              console.log(`Layer blend mode set to: ${randomBlendMode}`);
            }

            if (chkRotation.checked) {
              const randomRotation = Math.random() * 360;
              layer.rotate(randomRotation);
              console.log(`Layer rotated by: ${randomRotation}`);
            }

            if (chkScale.checked) {
              const scale = 20 + Math.random() * 180;
              layer.scale(scale, scale);
              console.log(`Layer scaled by: ${scale}%`);
            }
          }

          console.log("Layer randomization completed successfully.");
        },
        { commandName: "Randomize Layers" }
      );
    } catch (err) {
      console.error("Error randomizing layers:", err);
    }
  });
});
