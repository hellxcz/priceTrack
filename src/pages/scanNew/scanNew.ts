import {Component, OnInit} from "@angular/core";
import {NavController} from "ionic-angular";
import {BarcodeScanner} from "ionic-native";
import {ItemCategoryDao} from "../../model/entities";
import {ItemCategory} from "../../model/valueObjects";

@Component({
    selector: 'scanNew-page',
    templateUrl: 'scanNew.html'
})
export class ScanNewPage implements OnInit {


    public model: Model;

    public categories: ItemCategory[];

    // form: ControlGroup;

    constructor(private navCtrl: NavController,
                // private fb: FormBuilder,
                private itemCategoryDao: ItemCategoryDao) {
        this.model = new Model();

        // http://www.gajotres.net/ionic-2-how-o-create-and-validate-forms/2/

        // this.form = this.fb.group({
        //     'code': ['', Validators.compose([Validators.required])],
        //     'price': ['', Validators.compose([Validators.required])],
        //     'name': ['', Validators.compose([Validators.required])],
        //     'category': ['', Validators.compose([Validators.required,])],
        // });

    }

    ngOnInit() {

        this.itemCategoryDao.getAll()
            .then(items => {

                this.categories = items;

            });


    }

    onSubmit(data: Model) {

    }

    // private getFormControl(name: string): AbstractControl {
    //     return this.form.controls[name];
    // }
    //
    // hasFieldError(form:ControlGroup, name: string): boolean {
    //     let formControl = form.controls[name];
    //
    //     return !formControl.valid && formControl.touched;
    // }

    barcodeClicked() {

        BarcodeScanner.scan()
            .then(
                data => {

                    console.debug(data);


                    //this.model.code = data.

                },
                err => {

                }
            )

    }

    saveClicked() {

    }

    ocrClicked() {
        // check https://github.com/gustavomazzoni/cordova-plugin-tesseract

    }


}

export class Model {

    constructor(public code: string = "",
                public price: number = 0,
                public description: string = "",
                public categoryId: string = null) {
    }
}