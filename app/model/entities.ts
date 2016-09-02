export interface WithId {
    id: string;
}

export interface WithName {
    name: string;
}

export interface WithValue<T> {
    value: T;
}

export class ItemCategory implements WithId, WithName {

    id: string;
    name: string;

}

export class Item implements WithId, WithName {

    id: string;
    name: string;

    categories: Array<string>;

    barcodes: Array<Barcode>;

    description: string;

    prices: Array<Price>;


}

export class Barcode implements WithValue<string> {

    value: string;

}

export class Price implements WithId, WithValue<number> {

    id: string;

    value : number;

    time: Date;

}