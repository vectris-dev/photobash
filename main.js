document.addEventListener("DOMContentLoaded", () => {
  const btnImport = document.getElementById("btnImport");
  const btnRandomize = document.getElementById("btnRandomize");
  const chkBlendModes = document.getElementById("chkBlendModes");
  const chkRotation = document.getElementById("chkRotation");
  const chkScale = document.getElementById("chkScale");
  const chkPosition = document.getElementById("chkPosition");
  const chkReorder = document.getElementById("chkReorder");

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
      });

      if (!files || files.length === 0) return;

      await core.executeAsModal(
        async () => {
          const targetDoc = app.activeDocument;
          for (const file of files) {
            try {
              console.log(`Attempting to open file: ${file.name}`); // Log the filename before attempting to open
              const tempDoc = await app.open(file);

              // Resize the image to fit the target document's dimensions
              await tempDoc.resizeImage(targetDoc.width, targetDoc.height);

              console.log(`Temporary document width set to: ${tempDoc.width}`);
              console.log(`Temporary document height set to: ${tempDoc.height}`);
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
      const app = require("photoshop").app;
      const core = require("photoshop").core;
      const constants = require("photoshop").constants;

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

          if (chkReorder.checked) {
            // Helper function to shuffle an array using Fisher-Yates
            function shuffle(array) {
              let currentIndex = array.length,  randomIndex;
              while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                // Swap
                [array[currentIndex], array[randomIndex]] = [
                  array[randomIndex],
                  array[currentIndex],
                ];
              }
              return array;
            }
          
            // Collect all non-background layers
            const nonBackgroundLayers = layers.filter((l) => !l.isBackgroundLayer);
          
            // Shuffle them
            shuffle(nonBackgroundLayers);
          
            // Move each shuffled layer to the top of the stack (just above the topmost layer)
            // so that the final order in 'layers' matches the shuffled order.
            nonBackgroundLayers.forEach((layer) => {
              // Move layer above the topmost layer in the document
              layer.moveAbove(doc.layers[0]);
            });
          
            console.log("Layers reordered (excluding background layer).");
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
