import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ReportDataService {

    constructor() { }

    getReportDataObject(reportRO: any): any {
        return this.convertKeysToHumanReadable({
            "Sender Name": reportRO.modalData.sender_name,
            "Sender Address Type": reportRO.modalData.sender_address_type,
            "Sender Email": reportRO.modalData.sender_email,
            "Subject": reportRO.modalData.subject,
            "To": reportRO.modalData.to,
            "Cc": reportRO.modalData.cc,
            "Bcc": reportRO.modalData.bcc,
            "Conversation Topic": reportRO.modalData.conversation_topic,
            "Folders List": this.getFoldersList(reportRO.extractedData),
            "Preview Text": reportRO.modalData.preview_text,
            "servers involved": this.getServersList(reportRO.serversList),
            "Sender Email Server": reportRO.modalData.sender_email_server,
            "Sender Ip Address": reportRO.receivedList[0]?.senderIP,
            "Sender Domain": reportRO.receivedList[0].senderDomain,
            "Receiver Server": reportRO.receivedList[0].receivingServer,
            "Receiver Domain": reportRO.receivedList[0].receiverDomain,
            "Sender SMTP Address": reportRO.modalData.sender_smtp_address,
            "Delivery Time": reportRO.modalData.delivery_time,
            "Message Encryption Status": reportRO.modalData.encryption_status,
            "ARC Message Signature": reportRO.modalData.arc_message_signature,
            "Arc Seal": reportRO.modalData.arc_seal,
            "Authenticated ?": reportRO.modalData.authenticated,
            "Client Submit Time": reportRO.modalData.client_submit_time,
            "images": reportRO.modalData.images,
            "labels": reportRO.modalData.labels,
            "Receiver Ip Address": reportRO.modalData.receiver_ip_address,
            "EmailClient Name": reportRO.modalData.sender_name,
            "Signature": reportRO.headerData.signature,
            "File Format": reportRO.headerData.file_format,
            "Version": reportRO.headerData.version,
            "ESMTP ID": reportRO.receivedList[0]?.id,
            "Encryption Status": reportRO.encryptionStatus,
            "Domain Name":reportRO.whoIsLookUpData.domain_name,
            "Registrar":reportRO.whoIsLookUpData.registrar,
            "Registrar URL":reportRO.whoIsLookUpData.registrar_url,
            "Registered On":reportRO.whoIsLookUpData.creation_date,
            "Expires On":reportRO.whoIsLookUpData.expiration_date,
            "Updated On":reportRO.whoIsLookUpData.updated_date,
            "Status":reportRO.whoIsLookUpData.status,
            "Registrant Organization":reportRO.whoIsLookUpData.organization,
            "Registrant State":reportRO.whoIsLookUpData.state,
            "Registrant Country":reportRO.whoIsLookUpData.country,
            "Registrant Email":reportRO.whoIsLookUpData.emails,
        });
    }

    convertKeysToHumanReadable(inputObject: any) {
        const RESULT_OBJECT: any = {};
        for (const key in inputObject) {
            if (inputObject.hasOwnProperty(key)) {
                const HUMAN_READABLE_KEY = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                RESULT_OBJECT[HUMAN_READABLE_KEY] = inputObject[key];
            }
        }
        return RESULT_OBJECT;
    }

    getServersList(arrayList: any): any {
        return arrayList.map((E: any) => `${E.serverName}, ${E.ipAddress}`).join('; ');
    }

    getFoldersList(arrayList: any) {
        return arrayList.map((E: any) => `${E.folder_name}: ${E.total_items}`).join(', ');
    }


}

export class ReportRO {
    modalData: any = {};
    serversList: any = [];
    headerData: any = {};
    receivedList: any = [];
    extractedData: any = [];
    encryptionStatus: string = '';
    whoIsLookupData: any = [];
}
