import {AngularIndexedDB} from "../common/angular2-indexeddb";
import {Item, ItemCategory, Barcode, Price, WithId} from "./valueObjects";
import {Dao} from "./dataAccess";


export class ItemDao extends Dao<Item> {
    getStoreName(): string {
        return "Item";
    }
}

export class ItemCategoryDao extends Dao<ItemCategory> {
    protected getStoreName(): string {
        return "ItemCategory";
    }
}

export class BarcodeDao extends Dao<Barcode> {
    protected getStoreName(): string {
        return "Barcode";
    }
}

export class PriceDao extends Dao<Price> {
    protected getStoreName(): string {
        return "Price";
    }
}

export class ItemEntityDao {

    private daos: Dao[];

    constructor(public client: AngularIndexedDB,
                public itemDao: ItemDao,
                public itemCategoryDao: ItemCategoryDao,
                public barcodeDao: BarcodeDao,
                public priceDao: PriceDao) {
        this.daos.push(itemDao, itemCategoryDao, barcodeDao, priceDao);
    }

    public getStoreNames(): string[] {
        return this.daos.map(item => item.getStoreName());
    }

}

export class ItemEntity {

    private item_objectStore = "item_objectStore";

    constructor(protected itemEntityDao: ItemEntityDao,
                protected item: Item) {

    }

    static create(itemEntityDao: ItemEntityDao, id: string, name: string, description: string = ""): ItemEntity {

        var item = new Item(id, name, description);

        return new ItemEntity(itemEntityDao, item);
    }

    public addCategory(category: ItemCategory): boolean {

        var foundCategory = this.item.categories
            .find(item => {
                return item.id == category.id;
            });

        if (foundCategory){
            return false;
        }

        this.item.categories.push(category);

        return true;
    }

    public addBarcode(barcode: Barcode): boolean {

        var foundBarcode = this.item.barcodes
            .find((item: Barcode) => {
                return item.value == barcode.value
            });

        if (foundBarcode) {
            return false;
        }

        this.item.barcodes.push(barcode);

        return true;
    }

    public addPrice(price: Price): boolean {

        var found = this.item.prices
            .find((item: Price) => {
                return item.equals(price);
            });

        if (found) {
            return false;
        }

        this.item.prices.push(price);

        return true;
    }

    public save(): Promise<any> {

        // use transaction over multiple objectstores

        this.itemEntityDao.client.executeInTransaction(
            this.itemEntityDao.getStoreNames(),
            (transaction) => {

                var promises: Promise[] = [];

                var update = (storeName: string, item: WithId): Promise => {

                    var promise = this.itemEntityDao.client.updateInTransaction(
                        transaction,
                        storeName,
                        item
                    );

                    promises.push(promise);

                    return promise;

                };


                this.item.barcodes.forEach(
                    (item) => update(
                        this.itemEntityDao.barcodeDao.getStoreName(),
                        item
                    )
                );

                this.item.categories.forEach(
                    (item) => update(
                        this.itemEntityDao.itemCategoryDao.getStoreName(),
                        item
                    )
                )


            }
        );


    }

}