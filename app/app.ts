import {Component, Injectable} from "@angular/core";
import {Platform, ionicBootstrap} from "ionic-angular";
import {StatusBar} from "ionic-native";
import {TabsPage} from "./pages/tabs/tabs";
import {ItemDao, ItemCategoryDao, BarcodeDao, PriceDao, ItemEntityDao, ItemEntityBuilder} from "./model/entities";
import {IndexedDBConfiguration, AngularIndexedDB} from "./common/angular2-indexeddb";
import {ItemCategory} from "./model/valueObjects";

@Injectable()
export class IndexedDBConfigurationImpl extends IndexedDBConfiguration {
    getDbName(): string {
        return "PriceTrack";
    }

    getDbVersion(): number {
        return 1;
    }
}


@Component({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [
        ItemEntityBuilder, ItemEntityDao, PriceDao, BarcodeDao, ItemCategoryDao, ItemDao,
        {
            provide: IndexedDBConfiguration,
            useClass: IndexedDBConfigurationImpl
        },
        AngularIndexedDB]
})
export class MyApp {

    private rootPage: any;

    constructor(private platform: Platform,
                private angularIndexedDb: AngularIndexedDB,
                private itemCategoryDao:ItemCategoryDao
    ) {
        this.rootPage = TabsPage;

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            this.initDb();
        });
    }

    private initDb(){

        this.angularIndexedDb.createStore(1,

            (e, db) =>{

                db.createObjectStore(ItemDao.getStoreName());
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


                categories.forEach(category =>{
                    this.itemCategoryDao.update(category);
                });


            }
        )
    }
}

ionicBootstrap(MyApp);
