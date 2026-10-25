import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Terrain } from '@udonarium/terrain';
import { configureComponentTestingModule } from '../../testing/component-testing';

import { TerrainComponent } from './terrain.component';

describe('TerrainComponent', () => {
  let component: TerrainComponent;
  let fixture: ComponentFixture<TerrainComponent>;
  let terrain: Terrain;

  beforeEach(waitForAsync(() => {
    configureComponentTestingModule([TerrainComponent]).compileComponents();
  }));

  beforeEach(() => {
    terrain = Terrain.create('地形', 2, 2, 2, '', '');
    fixture = TestBed.createComponent(TerrainComponent);
    component = fixture.componentInstance;
    component.terrain = terrain;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    terrain.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
