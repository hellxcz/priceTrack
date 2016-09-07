import {
    addProviders,
    inject
} from '@angular/core/testing';
import {AngularIndexedDB} from "../common/angular2-indexeddb";

// Load the implementations that should be tested
// import { App } from './app.component';
// import { AppState } from './app.service';

var dbName = 'testDB';
var itemsObjectStoreName = "items";

class DummyItem {

    constructor(public id: string,
                public value: string) {
    }

}

describe('indexedDb-playground using vanilla client', () => {

    var db: IDBDatabase;

    beforeEach((done) => {

        var deleteRequest = indexedDB.deleteDatabase(dbName);

        var openDb = () => {

            var request = indexedDB.open(dbName);

            request.onupgradeneeded = (evt) => {

                // The database did not previously exist, so create object stores and indexes.
                var db = request.result;
                var store = db.createObjectStore(itemsObjectStoreName);//, {keyPath: "id"});
                // var titleIndex = store.createIndex("by_title", "title", {unique: true});
                // var authorIndex = store.createIndex("by_author", "author");

                // Populate with initial data.
                // store.put({title: "Quarry Memories", author: "Fred", isbn: 123456});
                // store.put({title: "Water Buffaloes", author: "Fred", isbn: 234567});
                // store.put({title: "Bedrock Nights", author: "Barney", isbn: 345678});
                //

            };

            request.onsuccess = (evt: Event) => {

                db = request.result;

                done();
            };

            request.onerror = (evt) => {
                done.fail("indexDb init failed");
            };

        };

        deleteRequest.onsuccess = () => {
            openDb();
        };

        deleteRequest.onerror = () => {
            openDb();
        };


    });


    afterEach((done) => {

        db.close();

        done();

    });

    it('should be able to save and read using vanilla', (done) => {


        var tx = db.transaction(itemsObjectStoreName, "readwrite");
        var store = tx.objectStore(itemsObjectStoreName);


        store.put(new DummyItem("1", "1-value"), "1");
        store.put(new DummyItem("2", "2-value"), "2");
        store.put(new DummyItem("3", "3-value"), "3");
        store.put(new DummyItem("4", "4-value"), "4");

        tx.oncomplete = () => {

            var tx = db.transaction(itemsObjectStoreName, "readwrite");
            var store = tx.objectStore(itemsObjectStoreName);

            var getRequest = store.get("1");

            getRequest.onsuccess = () => {

                var result = getRequest.result;

                done();

            };
        };

        // store.get("1")
    });
});

describe('indexedDb-playground using client', () => {


    var client: AngularIndexedDB;

    var index_valueName = "index_value";

    beforeEach((done) => {


        client = new AngularIndexedDB(dbName, 1);

        var callback = () => {
            client
                .createStore(1,
                    (e: Event, db: IDBDatabase) => {

                        var objectStore = db.createObjectStore(itemsObjectStoreName);
                        objectStore.createIndex(index_valueName, "value");

                    })
                .then((e) => {

                    console.error("got error");
                    console.error(e);

                    done();

                });
        };

        client.deleteDatabase().then(
            () => {
                callback();
            }
            , (e) => {

                console.error("got error");
                console.error(e);

                callback();
            });


    });

    afterEach((done) => {

        client.close();

        done();

    });


    it('should be able to use AngularIndexedDB for reads and writes', (done) => {

        var itemId = "1";

        var itemValue = "value";

        client.add(itemsObjectStoreName, new DummyItem(itemId, itemValue))
            .then(() => {

                client.getByKey<DummyItem>(itemsObjectStoreName, itemId)
                    .then((item) => {

                        expect(item).toBeDefined();

                        expect(item.id).toBe(itemId);
                        expect(item.value).toBe(itemValue);


                        done();

                    });


            }, (e) => {

                console.error(e);

            });


    });

    it('should be able to create index and get data by index', (done) => {

        // index must be created in upgradeCallback callback

        var value = "value";

        client.add(itemsObjectStoreName, new DummyItem("1", value))
            .then(() => {

                client.getByIndex(itemsObjectStoreName, index_valueName, value)
                    .then((item) => {

                        expect(item).toBeDefined();

                        expect(item.value).toBe(value);

                        done();
                    })
            });
    });
});