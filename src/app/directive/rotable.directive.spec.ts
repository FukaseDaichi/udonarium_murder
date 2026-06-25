import { ElementRef } from '@angular/core';

import { RotableDirective } from './rotable.directive';

describe('RotableDirective', () => {
  it('should create an instance', () => {
    const directive = new RotableDirective(new ElementRef(document.createElement('div')), null, null, null, null);
    expect(directive).toBeTruthy();
  });
});
