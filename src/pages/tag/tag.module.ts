import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TagPage } from './tag';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [
        TagPage,
    ],
    imports: [
        IonicPageModule.forChild(TagPage),
        PipesModule
    ],
    exports: [
        TagPage
    ]

})
export class TagPageModule {}