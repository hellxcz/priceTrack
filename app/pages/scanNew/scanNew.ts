import {Component} from '@angular/core';
import {NavController, Platform} from "ionic-angular";
import {BarcodeScanner, Cordova, CordovaInstance} from "ionic-native";
import {ItemCategoryDao} from "../../model/entities";
import {ItemCategory} from "../../model/valueObjects";

@Component({
    templateUrl: 'build/pages/scanNew/scanNew.html'
})

export class ScanNewPage{

    public model:Model;

    public categories:ItemCategory[];

    constructor(
        private navCtrl: NavController,
        private itemCategoryDao: ItemCategoryDao
    ){
        this.model = new Model();

        itemCategoryDao.getAll()
            .then(items =>{

                this.categories = items;

            });

    }

    scanClicked(){

        BarcodeScanner.scan()
            .then(

                data =>{

                    console.debug(data);


                    //this.model.code = data.

                },
                err =>{

                }

            )

    }

    saveClicked(){

    }

    ocrClicked(){
        // check https://github.com/gustavomazzoni/cordova-plugin-tesseract

    }


}

class Model{

    constructor(
        public code:string = "",
        public price:number = 0,
        public description:string = "",
        public categoryId:string = null
    )
    {}
}