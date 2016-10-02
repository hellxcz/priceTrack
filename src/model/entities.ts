import {AngularIndexedDB, IndexedDBConfiguration} from "../common/angular2-indexeddb";
import {Item, ItemCategory, Barcode, Price, WithId} from "./valueObjects";
import {
    Injectable,
    // Component,
    NgModule
} from "@angular/core";
import {Dao} from "./dataAccess";


@Injectable()
export class ItemDao extends Dao<Item> {
    constructor(protected client: AngularIndexedDB) {
        super(client);
    }

    getStoreName(): string {
        return ItemDao.getStoreName();
    }

    static getStoreName(): string {
        return 'Item';
    }

    static getByLastChangedIndexName(): string {
        return 'byLastChangedIndex';
    }

    public getByLastChanged(): Promise<Item[]> {

        let result = [];

        let promise = new Promise<Item[]>((resolve, reject) => {


            this.getIndexCursor(
                item => {

                    if (item) {
                        result.push(item)
                    } else {
                        resolve(result);

                    }

                },
                e => reject(e),
                ItemDao.getByLastChangedIndexName()
            )
        });

        return promise;

    }
}

@Injectable()
export class ItemCategoryDao extends Dao<ItemCategory> {
    constructor(protected client: AngularIndexedDB) {
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
    constructor(protected client: AngularIndexedDB) {
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
    constructor(protected client: AngularIndexedDB) {
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
export class DBInitializer {

    private daos: Dao<any>[] = [];

    constructor(private angularIndexedDb: AngularIndexedDB,
                private itemDao: ItemDao,
                private itemCategoryDao: ItemCategoryDao,
                private barcodeDao: BarcodeDao,
                private priceDao: PriceDao) {

        this.daos.push(itemDao, itemCategoryDao, barcodeDao, priceDao);

    }

    init(): Promise<any> {

        let result = new Promise<any>((resolve, reject) => {



            // db version 1
            let v1Promise = this.angularIndexedDb.createStore(1,

                (e, db) => {

                    let itemObjectStore = db.createObjectStore(ItemDao.getStoreName());

                    itemObjectStore.createIndex(ItemDao.getByLastChangedIndexName(), "lastChanged");


                    db.createObjectStore(ItemCategoryDao.getStoreName());
                    db.createObjectStore(BarcodeDao.getStoreName());
                    db.createObjectStore(PriceDao.getStoreName());

                }
            ).then(
                () => {

                    let categories: Array<ItemCategory> = [
                        new ItemCategory("1", "Pečivo"),
                        new ItemCategory("2", "Mléčné výrobky a vejce"),
                        new ItemCategory("3", "Maso, ryby a lahůdky"),
                        new ItemCategory("4", "Ovoce a zelenina"),
                        new ItemCategory("5", "Trvanlivé potraviny"),
                        new ItemCategory("6", "Mražené potraviny"),
                        new ItemCategory("7", "Nápoje"),
                        new ItemCategory("8", "Péče o domácnost"),
                        new ItemCategory("9", "Péče o děti"),
                        new ItemCategory("10", "Drogerie a kosmetika"),
                        new ItemCategory("11", "Zvířata, Domov a zábava"),
                    ];

                    categories.forEach(category => {
                        this.itemCategoryDao.update(category);
                    });
                }
            );

            Promise.all(
                [v1Promise]
            ).then(
                () => {
                    resolve()
                },
                (e) => {
                    reject(e);
                }
            );

            // db version 2

        });

        return result;

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
export class ItemEntityBuilder {

    constructor(protected itemEntityDao: ItemEntityDao) {
    }

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

    // private item_objectStore = "item_objectStore";

    private categories: Array<ItemCategory> = [];
    private barcodes: Array<Barcode> = [];
    private prices: Array<Price> = [];

    constructor(protected itemEntityDao: ItemEntityDao,
                protected item: Item) {

    }

    private onChanged() {

        this.item.lastChanged = new Date();

    }

    public addCategory(category: ItemCategory): boolean {

        if (this.item.categories.indexOf(category.id) > 0) {
            return false;
        }

        this.onChanged();

        this.item.categories.push(category.id);
        this.categories.push(category);

        return true;
    }

    public addBarcode(barcode: Barcode): boolean {

        if (this.item.barcodes.indexOf(barcode.id) > 0) {
            return false;
        }

        this.onChanged();

        this.item.barcodes.push(barcode.id);
        this.barcodes.push(barcode);

        return true;
    }

    public addPrice(price: Price): boolean {

        if (this.item.prices.indexOf(price.id) > 0) {
            return false;
        }

        this.onChanged();

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

@Injectable()
export class IndexedDBConfigurationImpl extends IndexedDBConfiguration {
    getDbName(): string {
        return "PriceTrack";
    }

    getDbVersion(): number {
        return 1;
    }
}


@NgModule({
    providers : [
        ItemEntityBuilder, ItemEntityDao, PriceDao, BarcodeDao, ItemCategoryDao, ItemDao,
        {
            provide: IndexedDBConfiguration,
            useClass: IndexedDBConfigurationImpl
        },
        DBInitializer,
        AngularIndexedDB
    ]
})
export class EntitiesModule{}

