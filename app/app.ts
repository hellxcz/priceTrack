import {Component, Injectable} from "@angular/core";
import {Platform, ionicBootstrap} from "ionic-angular";
import {StatusBar} from "ionic-native";
import {TabsPage} from "./pages/tabs/tabs";
import {ItemDao, ItemCategoryDao, BarcodeDao, PriceDao, ItemEntityDao, ItemEntityBuilder} from "./model/entities";
import {IndexedDBConfiguration, AngularIndexedDB} from "./common/angular2-indexeddb";

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

    constructor(private platform: Platform) {
        this.rootPage = TabsPage;

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });
    }
}

ionicBootstrap(MyApp);
