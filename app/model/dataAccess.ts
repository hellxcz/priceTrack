import {WithId} from "./entities";
export interface DataAccess<T extends WithId>{

    getById(id: string):T;
    getByIds(ids: string[]):T[];

    upsert(item:T):void;

}