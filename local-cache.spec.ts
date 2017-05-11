import { TestBed, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { LocalCache } from './local-cache';
import { OStorage } from '../providers/o-storage';
import { Observable } from 'rxjs';
import { MockOStorage } from '../mocks';

describe('LocalCache Test', () => {
  let subject: LocalCache;
  let backend: MockBackend;
  let data = {
    name: 'whocares'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalCache
        ,{provide: OStorage, useClass: MockOStorage}
        ,MockBackend
        ,BaseRequestOptions
        ,{
          provide: Http,
          useFactory: (mockBackend, defaultOptions) => {
            return new Http(mockBackend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
  });

  beforeEach(inject([LocalCache, MockBackend], (lc, mockBackend) => {
    subject = lc;
    backend = mockBackend;
  }));

  describe('data not in cache', () => {
    beforeEach(() => {
      spyOn(MockOStorage.prototype, 'get').and.returnValue(
        Observable.create( (o) => {
          o.next(null);
        }));
    });

    it('calls http', (done) => {
      backend.connections.subscribe((connection: MockConnection) => {
        let options = new ResponseOptions({ body: data });
        connection.mockRespond(new Response(options));
      });

      subject.getCacheOrData('key').subscribe((response) => {
        expect(response).toEqual(data);
        done();
      });
    });
  })

  describe('data in cache', () => {
    var cacheData = { d: "cached" };
    beforeEach(() => {
      spyOn(MockOStorage.prototype, 'get').and.returnValue(
        Observable.create( (o) => {
          o.next(cacheData);
        }));
    });

    it('gets cached data', (done) => {
      subject.getCacheOrData('key').subscribe((response) => {
        expect(response).toEqual(cacheData);
        done();
      });
    })

    describe('expire data', () => {
      var httpData:any = data;
      beforeEach((done) => {
        backend.connections.subscribe((connection: MockConnection) => {
          let options = new ResponseOptions({ body: httpData });
          connection.mockRespond(new Response(options));
        });

        subject.getCacheOrData('key').subscribe((response) => {
          subject.expireData('key');
          done();
        });
      })
      it('expire data, should call http', (done) => {
        httpData = { d: "NEWDATA" };
        subject.getCacheOrData('key').subscribe((response) => {
          expect(response).toEqual(httpData);
          done();
        });
      })
    })
  })
});