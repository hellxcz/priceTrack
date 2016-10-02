import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector:'contact-page',
  templateUrl: 'contact.html'
})
export class ContactPage {
  constructor(private navCtrl: NavController) {
  }
}
