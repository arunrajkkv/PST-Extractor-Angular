import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

    getExtractedData(file: string) {
        return this._http.get<any>(`${this.baseUrl}getExtractedData?file=${file}`);
    }

    getWhoIsLookUpData(domainName: string): any {
        return this._http.get<any>(`${this.baseUrl}whoIs?domain=${domainName}`);
    }

    getNSLookUpData(domainName: string): any {
        return this._http.get<any>(`${this.baseUrl}nslookup?domain=${domainName}`);
    }

    exportToPDF(extractedData: any): Observable<Blob> {
      return this._http.post(`${this.baseUrl}generate/report`, extractedData, {
        responseType: 'blob',
      });
    }

}
