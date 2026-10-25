import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TextNote } from '@udonarium/text-note';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { TextNoteComponent } from './text-note.component';

describe('TextNoteComponent', () => {
  let component: TextNoteComponent;
  let fixture: ComponentFixture<TextNoteComponent>;
  let textNote: TextNote;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([TextNoteComponent]).compileComponents();
  }));

  beforeEach(() => {
    textNote = TextNote.create('共有メモ', 'テキスト');
    fixture = TestBed.createComponent(TextNoteComponent);
    component = fixture.componentInstance;
    component.textNote = textNote;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    textNote.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
