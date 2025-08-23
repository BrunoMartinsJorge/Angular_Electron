import { TestBed } from '@angular/core/testing';

import { FormulariosServices } from './formularios-services';

describe('FormulariosServices', () => {
  let service: FormulariosServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulariosServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
