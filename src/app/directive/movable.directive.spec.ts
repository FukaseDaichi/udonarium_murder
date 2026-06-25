import { ElementRef } from '@angular/core';

import { MovableDirective } from './movable.directive';

describe('MovableDirective', () => {
  it('should create an instance', () => {
    const directive = new MovableDirective(null, new ElementRef(document.createElement('div')), null, null, null, null);
    expect(directive).toBeTruthy();
  });
});
