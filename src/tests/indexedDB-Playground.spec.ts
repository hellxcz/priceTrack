import {AngularIndexedDB, IndexDirection} from "../common/angular2-indexeddb";

// Load the implementations that should be tested
// import { App } from './app.component';
// import { AppState } from './app.service';

let dbName = 'testDB';
let itemsObjectStoreName = "items";

class DummyItem {

    constructor(public id: string,
                public value: string) {
    }
}

describe('indexedDb-playground using vanilla client', () => {

    let db: IDBDatabase;

    beforeEach((done) => {

        var deleteRequest = indexedDB.deleteDatabase(dbName);

        var openDb = () => {

            var request = indexedDB.open(dbName);

            request.onupgradeneeded = (evt) => {

                // The database did not previously exist, so create object stores and indexes.
                var db = request.result;
                // var store =
                db.createObjectStore(itemsObjectStoreName);//, {keyPath: "id"});
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


        let tx = db.transaction(itemsObjectStoreName, "readwrite");
        let store = tx.objectStore(itemsObjectStoreName);


        store.put(new DummyItem("1", "1-value"), "1");
        store.put(new DummyItem("2", "2-value"), "2");
        store.put(new DummyItem("3", "3-value"), "3");
        store.put(new DummyItem("4", "4-value"), "4");

        tx.oncomplete = () => {

            let tx = db.transaction(itemsObjectStoreName, "readwrite");
            let store = tx.objectStore(itemsObjectStoreName);

            let getRequest = store.get("1");

            getRequest.onsuccess = () => {

                // let result =
                getRequest.result;

                done();

            };
        };

        // store.get("1")
    });
});

describe('indexedDb-playground using client', () => {


    let client: AngularIndexedDB;

    let index_valueName = "index_value";

    beforeEach((done) => {


        client = new AngularIndexedDB({
            getDbName(){
                return dbName;
            },
            getDbVersion()  {
                return 1;
            }
        });

        let callback = () => {
            client
                .createStore(1,
                    (e: Event, db: IDBDatabase) => {

                        let objectStore = db.createObjectStore(itemsObjectStoreName);
                        objectStore.createIndex(index_valueName, "value");

                    })
                .then(
                    () => {
                        done();
                    },

                    (e) => {

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


    it('should be able to use AngularIndexedDB for reads and writes', done => {

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

    it('should be able to create index and get data by index', done => {

        // index must be created in upgradeCallback callback

        let value = "value";

        client.add(itemsObjectStoreName, new DummyItem("1", value))
            .then(() => {

                client.getByIndex<DummyItem>(itemsObjectStoreName, index_valueName, value)
                    .then((item) => {

                        expect(item).toBeDefined();

                        expect(item.value).toBe(value);

                        done();
                    })
            });
    });

    it('should be able to sort data by index', done => {

        client.executeInTransaction(
            [itemsObjectStoreName],
            (transaction) => {


                let items = [];

                for (let i = 0; i < 100; i++) {

                    let iString = i.toString();

                    items.push(new DummyItem(iString, iString));
                }

                let update = (item: DummyItem) => {

                    client.updateInTransaction(
                        transaction,
                        itemsObjectStoreName,
                        item
                    );
                };

                items.forEach(item => {

                    update(item);

                });

            }
        ).then(() => {

            client.getIndexCursor<DummyItem>(
                value => {

                    if (value) {

                        console.log(JSON.stringify(value));

                        //console.log(value);

                        //value.continue();
                    }
                    else {
                        done();
                    }
                },

                e => {
                },

                itemsObjectStoreName,
                index_valueName,
                IndexDirection.ASC
            );

        });
    }, 10000);

    it('should be able to update item', done => {

        var value = "value";
        var newValue = "new value";

        var failed = (e) => {
            console.error(e);

            done.fail(e);

        };

        client.add(itemsObjectStoreName, new DummyItem("1", value))
            .then(() => {

                client.getByKey<DummyItem>(itemsObjectStoreName, "1")
                    .then((item) => {

                        item.value = newValue;

                        client.update(itemsObjectStoreName, item)
                            .then(() => {

                                client.getByKey<DummyItem>(itemsObjectStoreName, "1")
                                    .then(newItem => {

                                        expect(newItem.value).toBe(newValue);

                                        done();
                                    })
                            }, failed)
                    }, failed)
            }, failed);

    });

    it('should be able to update not existing item', done => {

        var key = "1";

        client.update(itemsObjectStoreName, new DummyItem(key, "value"))
            .then(item => {

                    client.getByKey<DummyItem>(itemsObjectStoreName, key)
                        .then(item => {

                        });

                    done()

                },
                (e) => {
                    done(e)
                });

    });

    // it('should be able to handle item with functions', (done)=>{
    //
    //     var itemId = "1";
    //
    //     var itemValue = "value";
    //
    //     client.add(itemsObjectStoreName, new DummyItem(itemId, itemValue))
    //         .then(() => {
    //
    //             client.getByKey<DummyItem>(itemsObjectStoreName, itemId)
    //                 .then((item) => {
    //
    //                     expect(item).toBeDefined();
    //
    //                     expect(item.someFunction()).toBeDefined();
    //
    //                     done();
    //
    //                 });
    //
    //
    //         }, (e) => {
    //
    //             console.error(e);
    //
    //         });
    //
    //
    //
    // });
});