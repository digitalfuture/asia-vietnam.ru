import { Pipe, PipeTransform } from "@angular/core";

import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: "safeHtml" })

export class SafeHtml implements PipeTransform {
  constructor(public sanitized: DomSanitizer) {  }

  transform(html) {
    return this.trustedHtml(html);
  }

  trustedHtml(html: string) {
    return this.sanitized.bypassSecurityTrustHtml(html);
  }
}