import Alpine from 'https://esm.sh/alpinejs@3.15.0'
import * as AutomergeRepo from "https://esm.sh/@automerge/automerge-repo@2.4.0/slim?bundle-deps"
import { WebSocketClientAdapter } from "https://esm.sh/@automerge/automerge-repo-network-websocket@2.4.0?bundle-deps"
import { IndexedDBStorageAdapter } from "https://esm.sh/@automerge/automerge-repo-storage-indexeddb@2.4.0"

await AutomergeRepo.initializeWasm(
    // FIXME: https://github.com/automerge/automerge/issues/1191
    fetch("https://esm.sh/@automerge/automerge@3.1.2/dist/automerge.wasm")
);

const repo = new AutomergeRepo.Repo({
    network: [
        new WebSocketClientAdapter("wss://sync.automerge.org"),
    ],
    storage: new IndexedDBStorageAdapter(),
});

/* Check the location hash for a Automerge document URL */
const rootDocUrl = `${document.location.hash.substring(1)}`
let handle
if (AutomergeRepo.isValidAutomergeUrl(rootDocUrl)) {
    handle = await repo.find(rootDocUrl)
} else {
    handle = repo.create({ count: 0 })
    document.location.hash = handle.url;
}

Alpine.data('counter', () => {
    return {
        count: 0,
        doc: handle.doc(),

        async init() {
            this.count = this.doc.count;
            this.$watch('count', (value) => {
                handle.change((d) => (d.count = value));
            });
        }
    };
});

Alpine.start();
