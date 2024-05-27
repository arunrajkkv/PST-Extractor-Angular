/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PstExtractorTestComponent } from './pst-extractor-test.component';

describe('PstExtractorTestComponent', () => {
  let component: PstExtractorTestComponent;
  let fixture: ComponentFixture<PstExtractorTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PstExtractorTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PstExtractorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
