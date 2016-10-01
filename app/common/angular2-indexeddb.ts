'use strict';
import {Injectable} from "@angular/core";
import {WithId} from "../model/valueObjects";

export abstract class IndexedDBConfiguration {
    abstract getDbName():string;
    abstract getDbVersion():number;
}

@Injectable()
export class AngularIndexedDB {
    utils: Utils;
    dbWrapper: DbWrapper;

    constructor(conf:IndexedDBConfiguration) {
        this.utils = new Utils();
        this.dbWrapper = new DbWrapper(conf.getDbName(),conf.getDbVersion());
    }

    createStore(version, upgradeCallback: (e:Event, db:IDBDatabase)=>void): Promise<any> {
        let self = this,
            promise = new Promise<any>((resolve, reject) => {
                this.dbWrapper.dbVersion = version;
                let request = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
                request.onsuccess = (e) => {
                    this.dbWrapper.db = request.result;
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


        let promise = new Promise<any>((resolve, reject) => {

            let request = this.utils.indexedDB.deleteDatabase(this.dbWrapper.dbName);

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
        let result: T;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeNames: storeName,
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
                    storeNames: storeName,
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

    add<T extends WithId>(storeName: string, value: T):Promise<T> {
        let self = this;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeNames: storeName,
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
                    storeNames: storeName,
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

    updateInTransaction<T extends WithId>(transaction:IDBTransaction, objectStoreName:string, value:T):Promise<any>{

        let objectStore = transaction.objectStore(objectStoreName);

        let dbRequest = objectStore.put(value, value.id);

        let result = new Promise((resolve, reject) =>{

            dbRequest.onsuccess = (e)=>{
                resolve();
            };

            dbRequest.onerror = (e)=>{
                reject();
            };
        });

        return result;
    }

    executeInTransaction(storeNames:string[], callback:(IDBTransaction)=>void):Promise<Event>{

        let promise = new Promise<Event>((resolve, reject) => {

            let transaction = this.dbWrapper.createTransaction({
                storeNames: storeNames,
                dbMode: this.utils.dbMode.readWrite,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve(e);
                },
                abort: (e: Event) => {
                    reject(e);
                }
            });

            callback(transaction);

        });

        return promise;
    }

    delete(storeName: string, key: any):Promise<Event> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeNames: storeName,
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
                    storeNames: storeName,
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
                    storeNames: storeName,
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
        let result: T;
        let promise = new Promise<T>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeNames: storeName,
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

    getIndex(storeName: string, indexName:string): Promise<IDBIndex>{

        let self = this;
        let promise = new Promise<IDBIndex>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                    storeNames: storeName,
                    dbMode: self.utils.dbMode.readOnly,
                    error: (e: Event) => {
                        reject(e);
                    },
                    complete: (e: Event) => {
                        //resolve(result);
                    },
                    abort: (e: Event) => {
                        reject(e);
                    }
                }),
                objectStore = transaction.objectStore(storeName),
                index = objectStore.index(indexName);
                resolve(index);

        });

        return promise;
    }

    getIndexCursor<T>(callback: (value:T) => void, errorCallback: (e:Event) => void, storeName : string, indexName : string, indexDirection: IndexDirection = IndexDirection.ASC){

            this.getIndex(storeName, indexName)
                .then(index => {

                    let order = indexDirection == IndexDirection.ASC ? "next" : "prev";

                    let openCursorRequest = index.openCursor(null, order);

                    openCursorRequest.onsuccess = (e: any) => {

                        let cursor = <IDBCursorWithValue>e.target.result;

                        callback(cursor.value);

                        cursor.continue();

                    };

                    openCursorRequest.onerror = (e: Event) => {



                    };


                }, e => errorCallback(e));

    }

}

export enum IndexDirection{

    ASC,
    DESC

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
    storeNames: any,
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
        let trans: IDBTransaction = this.db.transaction(options.storeNames, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
}