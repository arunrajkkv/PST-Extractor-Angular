/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PstExtractorComponent } from './pst-extractor.component';

describe('PstExtractorComponent', () => {
  let component: PstExtractorComponent;
  let fixture: ComponentFixture<PstExtractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PstExtractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PstExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
