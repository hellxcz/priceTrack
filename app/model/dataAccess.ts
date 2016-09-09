import {WithId} from "./valueObjects";
import {AngularIndexedDB} from "../common/angular2-indexeddb";

export abstract class Dao<T extends WithId>{

    public abstract getStoreName():string;

    constructor(protected client:AngularIndexedDB){

    }

    private error(e:Event){
        console.error(e);
    }

    private ok(){

    }

    add(item:T):Promise<T>{
        return this.client.add(this.getStoreName(), item)
            .then(this.ok, this.error);
    }
    getAll():Promise<T[]>{
        return this.client.getAll(this.getStoreName())
            .then(this.ok, this.error);
    }
    update(item:T):Promise<T>{
        return this.client.update(this.getStoreName(), item)
            .then(this.ok, this.error);
    }
    delete(key:string):Promise<Event>{
        return this.client.delete(this.getStoreName(), key)
            .then(this.ok, this.error);
    }
    getByKey(key:string):Promise<T>{
        return this.client.getByKey(this.getStoreName(), key)
            .then(this.ok, this.error);
    }

    getByIndex(indexName:string, key:string):Promise<T>{
        return this.client.getByIndex(this.getStoreName(), indexName, key)
            .then(this.ok, this.error);
    }

}