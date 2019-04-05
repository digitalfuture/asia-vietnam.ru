import { FormatTime } from './format-time.pipe'
import { SafeHtml } from './safe-html.pipe'
import { ParseHtml } from './parse-html.pipe'
import { NgModule } from '@angular/core'

@NgModule({
    declarations: [
        SafeHtml,
        ParseHtml,
        FormatTime
    ],
    imports: [

    ],
    exports: [
        SafeHtml,
        ParseHtml,
        FormatTime
    ]
})
export class PipesModule {}