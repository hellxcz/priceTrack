import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {StatusBar} from "ionic-native";
import {ItemCategoryDao, DBInitializer} from "../model/entities";
import {AngularIndexedDB} from "../common/angular2-indexeddb";
import {HomePage} from "../pages/home/home";

@Component({
    templateUrl: 'app.html',
})
export class MyApp {

    private rootPage: any;

    constructor(private platform: Platform,
                private dbInitializer: DBInitializer,
                private angularIndexedDb: AngularIndexedDB,
                private itemCategoryDao: ItemCategoryDao) {


        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();

            this.dbInitializer.init()
                .then(() => {

                    this.rootPage = HomePage;

                });
        });
    }

}