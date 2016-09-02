import {
    addProviders,
    inject
} from '@angular/core/testing';

// Load the implementations that should be tested
// import { App } from './app.component';
// import { AppState } from './app.service';


describe('indexDb-playground', () => {

    var dbName = 'testDB';
    var db:IDBDatabase;
    var itemsObjectStoreName = "items";

    beforeEach((done) => {

        var request = indexedDB.open(dbName);

        request.onupgradeneeded = (evt) =>{

            // The database did not previously exist, so create object stores and indexes.
            var db = request.result;
            var store = db.createObjectStore(itemsObjectStoreName, {keyPath: "id"});
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

        request.onerror = (evt) =>{
            done.fail("indexDb init failed");
        };

    });


    afterEach((done)=>{

       db.close();

        done();

    });

    it('should be able to save', () => {


        var tx = db.transaction(itemsObjectStoreName, "readwrite");
        var store = tx.objectStore(itemsObjectStoreName);


    })

});