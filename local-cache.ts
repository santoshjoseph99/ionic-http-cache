import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { OStorage } from 'o-storage';
import { Observable } from 'rxjs';

@Injectable()
export default class LocalCache {
  
  expireMap: Map<string, number> = new Map();
  expireTimes: Map<string, number> = new Map();
  DEFAULT_TIME: number = 60*5*1000; // 5min in millisec

  constructor(public http: Http
             ,private ostorage: OStorage) { }

  public expireData(key){
    if( this.expireTimes.get(key) ){
      this.expireMap.set(key, this.expireMap.get(key) - (this.expireTimes.get(key)+100)); //1ms padding
    }
  }

  public expireAllData(){
    this.expireMap.forEach((value:number, key:string) => {
      this.expireData(key);
    })
  }

  public getCacheOrData(key, expireTime = this.DEFAULT_TIME){
    let currentTime = this.getTime();
    this.expireTimes.set(key, expireTime);
    if( !this.expireMap.get(key) ){
      this.expireMap.set(key,  currentTime + this.expireTimes.get(key));
    } 
    if( this.isExpired(key, currentTime)){
      this.expireMap.set(key, currentTime + this.expireTimes.get(key));
      return this.getDataAndStore(key);
    }
    return this.ostorage.get(key).mergeMap(data => {
      if(data){
        return Observable.of(data);
      } else {
        return this.getDataAndStore(key);
      }
    });
  }

  private setExpireTime(key, currentTime){
    this.expireMap.set(key, currentTime + this.expireTimes.get(key));
  }
  
  private getDataAndStore(key){
    return this.http.get(key)
      .map(res => res.json())
      .do( data => {
        this.ostorage.set(key, data);
      });
  }

  private getTime(){
    return (new Date()).getTime();
  }

  private isExpired(key, currentTime){
    return currentTime > this.expireMap.get(key);
  }

}
