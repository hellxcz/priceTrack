import {NgModule} from "@angular/core";
import {IonicApp, IonicModule} from "ionic-angular";
import {MyApp} from "./app.component";
import {HomePage} from "../pages/home/home";
import {EntitiesModule} from "../model/entities";
import {ScanNewPage} from "../pages/scanNew/scanNew";

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ScanNewPage
    ],
    imports: [
        EntitiesModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ScanNewPage
    ],
    providers: []
})
export class AppModule {
}