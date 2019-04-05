import { Pipe, PipeTransform } from "@angular/core";
import * as moment from 'moment';

@Pipe({name: "formatTime"})

export class FormatTime implements PipeTransform {
    constructor() {
    }

    transform(string: string) {
        return this.formatTime(string)
    }

    formatTime(string: string) {
        moment.locale('ru');
	    return moment(string).format('LL')
    }
}