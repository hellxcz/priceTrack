import {AngularIndexedDB} from "../common/angular2-indexeddb";
import {Item, ItemCategory, Barcode, Price, WithId} from "./valueObjects";
import {Injectable,
    // Component,
    // NgModule
} from "@angular/core";
import {Dao} from "./dataAccess";


@Injectable()
export class ItemDao extends Dao<Item> {
    constructor(protected client:AngularIndexedDB){
        super(client);
    }

    getStoreName(): string {
        return ItemDao.getStoreName();
    }

    static getStoreName(): string {
        return 'Item';
    }
}

@Injectable()
export class ItemCategoryDao extends Dao<ItemCategory> {
    constructor(protected client:AngularIndexedDB){
        super(client);
    }

    getStoreName(): string {
        return ItemCategoryDao.getStoreName();
    }

    static getStoreName(): string {
        return 'ItemCategory';
    }
}

@Injectable()
export class BarcodeDao extends Dao<Barcode> {
    constructor(protected client:AngularIndexedDB){
        super(client);
    }

    getStoreName(): string {
        return BarcodeDao.getStoreName();
    }

    static getStoreName(): string {
        return 'Barcode';
    }
}

@Injectable()
export class PriceDao extends Dao<Price> {
    constructor(protected client:AngularIndexedDB){
        super(client);
    }

    getStoreName(): string {
        return PriceDao.getStoreName();
    }

    static getStoreName(): string {
        return 'Price';
    }
}

@Injectable()
export class ItemEntityDao {

    private daos: Dao<any>[] = [];

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

@Injectable()
export class ItemEntityBuilder{

    constructor(protected itemEntityDao: ItemEntityDao){}

    create(id: string, name: string, description: string = ""): Promise<ItemEntity> {

        return new Promise<ItemEntity>((resolve, reject) => {

            this.itemEntityDao.itemDao.getByKey(id)
                .then(item => {

                    let dirty = false;

                    if (!item) {
                        item = new Item(id, name, description);
                        dirty = true;
                    }

                    let itemEntity = new ItemEntity(this.itemEntityDao, item);

                    if (dirty) {
                        itemEntity
                            .save()
                            .then(() => {
                                    resolve(itemEntity);
                                }
                            );
                    } else {
                        resolve(itemEntity);
                    }

                }, (e) => {
                    reject(e);
                });

        });
    }


}

export class ItemEntity {

    private item_objectStore = "item_objectStore";

    private categories: Array<ItemCategory> = [];
    private barcodes: Array<Barcode> = [];
    private prices: Array<Price> = [];

    constructor(protected itemEntityDao: ItemEntityDao,
                protected item: Item) {

    }

    public addCategory(category: ItemCategory): boolean {

        if (this.item.categories.indexOf(category.id) > 0) {
            return false;
        }

        this.item.categories.push(category.id);
        this.categories.push(category);

        return true;
    }

    public addBarcode(barcode: Barcode): boolean {

        if (this.item.barcodes.indexOf(barcode.id) > 0) {
            return false;
        }

        this.item.barcodes.push(barcode.id);
        this.barcodes.push(barcode);

        return true;
    }

    public addPrice(price: Price): boolean {

        if (this.item.prices.indexOf(price.id) > 0) {
            return false;
        }


        this.item.prices.push(price.id);
        this.prices.push(price);

        return true;
    }

    public save(): Promise<any> {

        // use transaction over multiple objectstores

        return this.itemEntityDao.client.executeInTransaction(
            this.itemEntityDao.getStoreNames(),
            (transaction) => {

                let update = (dao: Dao<any>, item: WithId) => {

                    this.itemEntityDao.client.updateInTransaction(
                        transaction,
                        dao.getStoreName(),
                        item
                    );
                };

                let updateEach = (dao: Dao<any>, itemList: WithId[]) => {

                    itemList.forEach(item => {

                        update(dao, item);

                    });
                };

                updateEach(this.itemEntityDao.barcodeDao, this.barcodes);
                // updateEach(this.itemEntityDao.itemCategoryDao, this.categories);
                updateEach(this.itemEntityDao.priceDao, this.prices);

                update(
                    this.itemEntityDao.itemDao,
                    this.item
                );
            }
        );

    }

}

//
// @NgModule({
//     providers : [
//         ItemEntityBuilder, ItemEntityDao, PriceDao, BarcodeDao, ItemCategoryDao, ItemDao
//
//     ]
// })
// export class EntitiesModule{}
