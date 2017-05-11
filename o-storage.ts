import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {Observable} from 'rxjs';

@Injectable()
export default class OStorage {

  constructor(public storage: Storage) {
  }

  get(key) {
    return Observable.fromPromise(this.storage.get(key));
  }

  set(key, value){
    return Observable.fromPromise(this.storage.set(key, value));
  }

  remove(key){
    return Observable.fromPromise(this.storage.remove(key));
  }

  clear(){
    return Observable.fromPromise(this.storage.clear());
  }

}
