'use strict';
import {Injectable} from "@angular/core";
import {WithId} from "../model/entities";


@Injectable()
export class AngularIndexedDB {
    utils: Utils;
    dbWrapper: DbWrapper;

    constructor(dbName, version) {
        this.utils = new Utils();
        this.dbWrapper = new DbWrapper(dbName, version);
    }

    createStore(version, upgradeCallback: (Event, IDBDatabase)=>void): Promise {
        let self = this,
            promise = new Promise<any>((resolve, reject) => {
                this.dbWrapper.dbVersion = version;
                let request = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
                request.onsuccess = (e) => {
                    self.dbWrapper.db = request.result;
                    resolve();
                };

                request.onerror = (e: any) => {
                    console.error(e);

                    reject("IndexedDB error: " + e.target.errorCode);
                };

                request.onupgradeneeded = (e) => {
                    upgradeCallback(e, request.result);
                };
            });

        return promise;
    }

    close() {

        this.dbWrapper.db.close();

    };

    deleteDatabase(): Promise<any> {


        var promise = new Promise<any>((resolve, reject) => {

            var request = this.utils.indexedDB.deleteDatabase(this.dbWrapper.dbName);

            request.onsuccess = function (e) {
                resolve();
            };

            request.onerror = (e: any) => {

                console.error(e);

                reject("IndexedDB error: " + e.target.errorCode);
            };


        });

        return promise;

    }

    getByKey<T>(storeName: string, key: any): Promise<T> {
        let self = this;
        var result: T;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(result);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request;

            request = objectStore.get(key);
            request.onsuccess = (event) => {
                result = event.target.result;
            }
        });

        return promise;
    }

    getAll<T>(storeName: string): Promise<T[]> {
        let self = this;
        var result: T[] = [];
        let promise = new Promise<T[]>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(result);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor();

            request.onerror = function (e) {
                console.error(e);

                reject(e);
            };

            request.onsuccess = function (evt) {
                var cursor = (<IDBOpenDBRequest>evt.target).result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor["continue"]();
                }
            };
        });

        return promise;
    }

    add<T extends WithId>(storeName: string, value: T) {
        let self = this;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(value);
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            objectStore.add(value, value.id);
        });

        return promise;
    }

    update<T extends WithId>(storeName: string, value: T): Promise<T> {
        let self = this;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(value);
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            objectStore.put(value, value.id);
        });

        return promise;
    }

    delete(storeName: string, key: any) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);

            objectStore["delete"](key);
        });

        return promise;
    }

    openCursor(storeName, cursorCallback: (evt) => void) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor();

            request.onsuccess = (evt) => {
                cursorCallback(evt);
                resolve();
            };
        });

        return promise;
    }

    clear(storeName: string) {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readWrite,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve();
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName);
            objectStore.clear();
            resolve();
        });

        return promise;
    }

    getByIndex<T>(storeName: string, indexName: string, key: any): Promise<T> {
        let self = this;
        var result: T;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeName: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        resolve(result);
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                index = objectStore.index(indexName),
                request = index.get(key);

            request.onsuccess = (event) => {
                result = (<IDBOpenDBRequest>event.target).result;
            };
        });

        return promise;
    }
}

class Utils {
    dbMode: DbMode;
    indexedDB: IDBFactory;

    constructor() {
        this.indexedDB = window.indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || window.msIndexedDB;
        this.dbMode = {
            readOnly: "readonly",
            readWrite: "readwrite"
        };
    }
}

interface DbMode {
    readOnly: string;
    readWrite: string;
}

interface createTransactionOptions {
    storeName: string,
    dbMode: string,
    error: (e: Event) => any,
    complete: (e: Event) => any,
    abort?: (e: Event) => any
}

class DbWrapper {
    dbName: string;
    dbVersion: number;
    db: IDBDatabase;

    constructor(dbName, version) {
        this.dbName = dbName;
        this.dbVersion = version || 1;
        this.db = null;
    }

    validateStoreName(storeName) {
        return this.db.objectStoreNames.contains(storeName);
    };

    validateBeforeTransaction(storeName: string, reject) {
        if (!this.db) {
            reject('You need to use the createStore function to create a database before you query it!');
        }
        if (!this.validateStoreName(storeName)) {
            reject(('objectStore does not exists: ' + storeName));
        }
    }

    createTransaction(options: createTransactionOptions): IDBTransaction {
        let trans: IDBTransaction = this.db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
}