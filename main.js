document.addEventListener('DOMContentLoaded', () => {
    const btnImport = document.getElementById('btnImport');
    const btnRandomize = document.getElementById('btnRandomize');
    const chkBlendModes = document.getElementById('chkBlendModes');
    const chkRotation = document.getElementById('chkRotation');
    const chkScale = document.getElementById('chkScale');
    const chkPosition = document.getElementById('chkPosition');

    const blendModes = [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
        'colorDodge', 'colorBurn', 'hardLight', 'softLight', 'difference',
        'exclusion', 'hue', 'saturation', 'color', 'luminosity'
    ];

    btnImport.addEventListener('click', async () => {
        try {
            const fs = require('uxp').storage.localFileSystem;
            const app = require('photoshop').app;
            const core = require('photoshop').core;
            
            const files = await fs.getFileForOpening({
                allowMultiple: true,
                types: ['jpg', 'jpeg', 'png', 'tiff']
            });

            if (!files || files.length === 0) return;

            await core.executeAsModal(async () => {
                const targetDoc = app.activeDocument;

                for (const file of files) {
                    const tempDoc = await app.open(file);

                    const activeLayer = tempDoc.activeLayers[0];

                    await activeLayer.duplicate(targetDoc);

                    await tempDoc.closeWithoutSaving();
                }
            }, { commandName: 'Import Images as Layers' });

        } catch (err) {
            console.error('Error importing images:', err);
        }
    });

    btnRandomize.addEventListener('click', async () => {
        const app = require('photoshop').app;
        const core = require('photoshop').core;
        
        await core.executeAsModal(async () => {
            const doc = app.activeDocument;
            const layers = doc.layers;

            for (const layer of layers) {
                if (layer.locked) continue;

                if (chkBlendModes.checked) {
                    layer.blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
                }

                if (chkRotation.checked) {
                    layer.rotate(Math.random() * 360);
                }

                if (chkScale.checked) {
                    const scale = 20 + Math.random() * 180;
                    layer.scale(scale, scale);
                }

                if (chkPosition.checked) {
                    const bounds = doc.bounds;
                    const layerBounds = layer.bounds;
                    const x = Math.random() * (bounds.width - layerBounds.width/2);
                    const y = Math.random() * (bounds.height - layerBounds.height/2);
                    layer.translate(x, y);
                }
            }
        }, { commandName: 'Randomize Layers' });
    });
});