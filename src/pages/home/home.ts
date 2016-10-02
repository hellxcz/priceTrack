import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {BarcodeScanner} from 'ionic-native';
import {ItemEntityBuilder, ItemDao} from "../../model/entities";
import {Item} from "../../model/valueObjects";
import {ScanNewPage} from "../scanNew/scanNew";

@Component({
    selector:'home-page',
    templateUrl: 'home.html'
})
export class HomePage implements OnInit {

    public items: Item[];

    getName(): string {
        return "Home";
    }

    constructor(private navCtrl: NavController,
                private itemEntityFactory: ItemEntityBuilder,
                private itemDao: ItemDao) {

        BarcodeScanner
            .scan()
            .then(
                (data) => {

                    console.log("got some");
                    console.log(data);

                },
                (err) => {

                    console.log("got error:");
                    console.log(err);

                }
            );

    }

    ngOnInit() {

        this.itemDao.getByLastChanged()
            .then(items => {

                this.items = items;

                let testItem = new Item("3", "name", "some description", null, null, null);

                this.items.push(testItem);
            });

    }

    barcodeClicked(e) {
        this.navCtrl.push(ScanNewPage);
    }
}
