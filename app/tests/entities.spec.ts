import {ItemEntity, ItemEntityDao, ItemDao, ItemCategoryDao, BarcodeDao, PriceDao} from "../model/entities";
import {AngularIndexedDB} from "../common/angular2-indexeddb";
import {Price} from "../model/valueObjects";
describe('item entity', () => {

    let dbName = 'testDB';

    let client: AngularIndexedDB;

    let itemId = "id";


    beforeEach(done => {

        client = new AngularIndexedDB(dbName, 1);

        var callback = () => {
            client
                .createStore(1,
                    (e: Event, db: IDBDatabase) => {

                        db.createObjectStore(ItemDao.getStoreName());
                        db.createObjectStore(ItemCategoryDao.getStoreName());
                        db.createObjectStore(BarcodeDao.getStoreName());
                        db.createObjectStore(PriceDao.getStoreName());

                    })
                .then(
                    () => {
                        done();
                    },
                    (e) => {

                        console.error("got error");
                        console.error(e);

                        done();

                    });
        };

        client.deleteDatabase().then(
            () => {
                callback();
            }
            , (e) => {

                console.error("got error");
                console.error(e);

                callback();
            });

    });

    afterEach((done) => {

        client.close();

        done();

    });

    var create = (): Promise<ItemEntity> => {

        let itemDao = new ItemDao(client);
        let itemCategoryDao = new ItemCategoryDao(client);
        let barcodeDao = new BarcodeDao(client);
        let priceDao = new PriceDao(client);

        let itemEntityDao = new ItemEntityDao(client, itemDao, itemCategoryDao, barcodeDao, priceDao);

        return ItemEntity.create(itemEntityDao, itemId, "name");

    };

    it('should be able to create', done => {

        let itemEntity = create()
            .then(ItemEntity => {

                done();

            });
    });

    it('should be able to save', done => {

        create()
            .then(item => {

                item.save()
                    .then(() => {
                        done();

                    });

            }, e => {

                done(false);

            });
    });

    it('should be able to save after create', done =>{

        create()
            .then(item =>{


                let itemDao = new ItemDao(client);

                itemDao.getByKey(itemId)
                    .then(

                        itemByKey => {

                            expect(itemByKey).toBeDefined();
                            expect(itemByKey.id).toBe(itemId);

                            done();

                        }

                    )

            })

    });

    it('should update entity properly', done => {


        let priceDao = new PriceDao(client);

        let priceId = "1";

        let price = new Price(priceId, 50.43, Date());


        priceDao.update(price)
            .then(evt => {

                priceDao.update(price)
                    .then(evt => {

                        priceDao.getByKey(priceId)
                            .then((loaded) => {

                                expect(loaded.id).toBe(priceId);

                                done();

                            });
                    });
            });

    })

});