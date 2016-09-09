import {Item} from "ionic-angular";
import {AngularIndexedDB} from "../common/angular2-indexeddb";
export interface WithId {
    id: string;
}

export interface WithName {
    name: string;
}

export interface WithValue<T> {
    value: T;
}

export interface WithEquals<T> {
    equals(other: T): boolean;
}

export class ItemCategory implements WithId, WithName {

    constructor(public id: string,
                public name: string) {
    }

}

export class Item implements WithId, WithName {

    constructor(public id: string,
                public name: string,
                public description: string,
                public categories: Array<ItemCategory> = [],
                public barcodes: Array<Barcode> = [],
                public prices: Array<Price> = []) {
    }
}

export class Barcode implements WithId, WithValue<string> {

    constructor(
        public id: string,
        public value: string) {
    }

}

export class Price implements WithId, WithValue<number>, WithEquals<Price> {

    constructor(public id: string,
                public value: number,
                public time: Date) {
    }

    public equals(other: Price): boolean {
        return this.value == other.value
            && this.time == other.time;
    }
}
