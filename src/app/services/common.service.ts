import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  baseUrl = '';
  generalFileType: any = [];

  constructor(private _http: HttpClient) {
      this.baseUrl = this.getBaseHref();
  }

  getBaseHref(): any {
      return (document.getElementsByTagName('base')[0]).href;
  }

  getExtractedData() {
      return this._http.get(this.baseUrl + 'getExtractedData');
  }

  getPstHeader(filePath: string) {
    return this._http.post(this.baseUrl + 'getPstHeader', { 'filePath': filePath });
  }

  getPstHeader1(filePath: string) {
    const encodedFilePath = encodeURIComponent(filePath);
    const url = `${this.baseUrl}getPstHeader?file_path=${encodedFilePath}`;
    return this._http.get(url);
  }

}
