# No first-class Receipt; photo is intake only

Money Evidence images are not persisted as a Receipt aggregate. Receipt Extraction produces text facts; after confirm, only Transactions exist. The original image and audio are discarded. We rejected a first-class Receipt entity and blob storage to keep the model aligned with chat-first logging and avoid a new dashboard surface for v1.
