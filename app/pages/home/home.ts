import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {IPage} from "../../common/pages";
import { BarcodeScanner } from 'ionic-native';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage
implements IPage
{
  getName(): string {
    return "Home";
  }
  constructor(
    private navCtrl: NavController

  ) {

    BarcodeScanner
      .scan()
      .then(
        (data) => {
          var some = "";

            console.log("got some" );
            console.log(data );

        },
        (err) => {

          var some = "";
            console.log("got error:");
            console.log(err);

        }
      )

  }
}
