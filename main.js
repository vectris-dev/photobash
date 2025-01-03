document.addEventListener("DOMContentLoaded", () => {
  const btnImport = document.getElementById("btnImport");
  const btnRandomize = document.getElementById("btnRandomize");
  const chkBlendModes = document.getElementById("chkBlendModes");
  const chkRotation = document.getElementById("chkRotation");
  const chkScale = document.getElementById("chkScale");
  const chkPosition = document.getElementById("chkPosition");
  const chkReorder = document.getElementById("chkReorder");

  const app = require("photoshop").app;
  const core = require("photoshop").core;

  const blendModes = ["multiply", "screen", "overlay", "darken", "lighten", "colorDodge", "colorBurn", "hardLight", "softLight", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];

  btnImport.addEventListener("click", async () => {
    try {
      const fs = require("uxp").storage.localFileSystem;

      const files = await fs.getFileForOpening({
        allowMultiple: true,
      });

      if (!files || files.length === 0) return;

      await core.executeAsModal(
        async () => {
          const targetDoc = app.activeDocument;
          for (const file of files) {
            try {
              console.log(`Attempting to open file: ${file.name}`);
              const tempDoc = await app.open(file);
              await tempDoc.resizeImage(targetDoc.width, targetDoc.height);
              await tempDoc.activeLayers[0].duplicate(targetDoc);
              await tempDoc.closeWithoutSaving();
            } catch (innerErr) {
              console.error(`Error processing file: ${file.fullName}, Error: ${innerErr}`);
            }
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
      await core.executeAsModal(
        async () => {
          const doc = app.activeDocument;
          const layers = doc.layers;

          for (const layer of layers) {
            if (layer.locked || layer.kind === "artboard") continue;

            if (chkBlendModes.checked) {
              const randomBlendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
              layer.blendMode = randomBlendMode;
            }

            if (chkRotation.checked) {
              const randomRotation = Math.random() * 360;
              layer.rotate(randomRotation);
            }

            if (chkScale.checked) {
              const scale = 20 + Math.random() * 180;
              layer.scale(scale, scale);
            }
          }

          if (chkReorder.checked) {
            function shuffle(array) {
              let currentIndex = array.length,
                randomIndex;
              while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
              }
              return array;
            }

            const nonBackgroundLayers = layers.filter((l) => !l.isBackgroundLayer);

            shuffle(nonBackgroundLayers);

            nonBackgroundLayers.forEach((layer) => {
              layer.moveAbove(doc.layers[0]);
            });
          }
        },
        { commandName: "Randomize Layers" }
      );
    } catch (err) {
      console.error("Error randomizing layers:", err);
    }
  });
});
