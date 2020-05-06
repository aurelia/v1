import {autoinject} from 'aurelia-framework';

@autoinject
export class ColorCustomAttribute {
  constructor(private element: Element) {}

  valueChanged(newValue: string, oldValue: string): void {
    (this.element as HTMLElement).style.color = newValue;
  }
}
