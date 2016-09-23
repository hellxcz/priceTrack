import {Component} from '@angular/core';
import {NavController, Platform} from "ionic-angular";
import {BarcodeScanner, Cordova, CordovaInstance} from "ionic-native";

@Component({
    templateUrl: 'build/pages/scanNew/scanNew.html'
})

export class ScanNewPage{

    public model:Model;

    constructor(
        private navCtrl: NavController
    ){
        this.model = new Model();
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
        public description:string = ""
    )
    {}
}