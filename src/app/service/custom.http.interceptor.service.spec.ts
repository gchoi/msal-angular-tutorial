import { TestBed } from '@angular/core/testing';

import { Custom.Http.InterceptorService } from './custom.http.interceptor.service';

describe('Custom.Http.InterceptorService', () => {
  let service: Custom.Http.InterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Custom.Http.InterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
