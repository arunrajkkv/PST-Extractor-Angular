import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../services/common.service';

@Component({
    selector: 'app-pst-extractor',
    templateUrl: './pst-extractor.component.html',
    styleUrls: ['./pst-extractor.component.css']
})
export class PstExtractorComponent implements OnInit {

    @ViewChild('exampleModal') exampleModal: any;

    extractedData: any = [];
    clickedData: any;
    messageArray: any = [];
    isShowContentData = false;
    isShowFolderView = false;
    modalData: any = {};
    headerData: any = {};
    fileName: string = '';
    imagesArray: any = [];

    constructor(private _commonService: CommonService) { }

    ngOnInit() {
    }

    public getData(): void {
        let directoryPath = 'D:\\others\\pst files\\';
        const FILE = directoryPath + this.fileName;
        this._commonService.getExtractedData(FILE)
            .subscribe(
                (response: any) => {
                    if (response) {
                        this.extractedData = response;
                        this.isShowFolderView = true;
                        this.setContentForTableView();
                    }
                },
                error => {
                    console.log(error)
                    this.isShowFolderView = false;
                });
    }

    private setContentForTableView(): void {
        let tempMessageArray: any = [];
        if (this.extractedData && this.extractedData.length > 0) {
            this.extractedData.forEach((data: any) => {
                if (data.messages.length > 0) {
                    tempMessageArray.push(data.messages);
                }
            });
            this.messageArray = tempMessageArray[0];
        }
    }

    public onClickFolder(data: any): void {
        this.isShowContentData = true;
        this.headerData = data.header_data;
    }

    public onSelectPstFile(event: any): void {
        this.fileName = event ? event.srcElement.files[0].name : '';
    }

    public convertToDateObject(dateString: string): any {
        if (dateString) {
            const uint8Array = new TextEncoder().encode(dateString);/* Convert the string to a Uint8Array */
            const timestamp = new DataView(uint8Array.buffer).getUint32(0, true);/* Extract the timestamp from the Uint8Array */
            const milliseconds = timestamp * 1000;/* Convert the timestamp to milliseconds */
            const date = new Date();/* Create a new Date object with the milliseconds */
            date.setTime(milliseconds);
            return date;
        }
    }

    onClickTable(msg: any) {
      this.imagesArray = [];
      if (msg && msg.images.length > 0) {
        this.imagesArray = msg.images;
      }
    }

}
