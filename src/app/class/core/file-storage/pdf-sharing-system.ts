import { EventSystem, Network } from '../system';
import { UUID } from '../system/util/uuid';
import { BufferSharingTask } from './buffer-sharing-task';
import { FileReaderUtil } from './file-reader-util';
import { PdfContext, PdfFile, PdfState } from './pdf-file';
import { CatalogItem, PdfStorage } from './pdf-storage';
import { MimeType } from './mime-type';

export class PdfSharingSystem {
  private static _instance: PdfSharingSystem;
  static get instance(): PdfSharingSystem {
    if (!PdfSharingSystem._instance) PdfSharingSystem._instance = new PdfSharingSystem();
    return PdfSharingSystem._instance;
  }

  private sendTaskMap: Map<string, BufferSharingTask<PdfContext[]>> = new Map();
  private receiveTaskMap: Map<string, BufferSharingTask<PdfContext[]>> = new Map();
  private maxSendTask: number = 2;
  private maxReceiveTask: number = 4;

  private constructor() {
    console.log('FileSharingSystem ready...');
  }

  initialize() {
    EventSystem.register(this)
      .on('CONNECT_PEER', 1, (event) => {
        if (!event.isSendFromSelf) return;
        console.log('CONNECT_PEER PdfStorageService !!!', event.data.peerId);
        PdfStorage.instance.synchronize();
      })
      .on('XML_LOADED', (event) => {
        convertUrlPdf(event.data.xmlElement);
      })
      .on('SYNCHRONIZE_PDF_FILE_LIST', (event) => {
        if (event.isSendFromSelf) return;
        console.log('SYNCHRONIZE_PDF_FILE_LIST PdfStorageService ' + event.sendFrom);

        let otherCatalog: CatalogItem[] = event.data;
        let request: CatalogItem[] = [];

        for (let item of otherCatalog) {
          let pdf: PdfFile = PdfStorage.instance.get(item.identifier);
          if (pdf === null) {
            pdf = PdfFile.createEmpty(item.identifier);
            PdfStorage.instance.add(pdf);
          }
          if (pdf.state < PdfState.COMPLETE && !this.receiveTaskMap.has(item.identifier)) {
            request.push({ identifier: item.identifier, state: pdf.state });
          }
        }

        // Peer切断時などのエッジケースに対応する
        if (request.length < 1 && !this.hasActiveTask() && otherCatalog.length < PdfStorage.instance.getCatalog().length) {
          PdfStorage.instance.synchronize(event.sendFrom);
        }

        if (request.length < 1 || this.isLimitReceiveTask()) {
          return;
        }
        this.request(request, event.sendFrom);
      })
      .on('REQUEST_PDF_FILE_RESOURE', async (event) => {
        if (event.isSendFromSelf) return;

        let request: CatalogItem[] = event.data.identifiers;
        let randomRequest: CatalogItem[] = [];

        for (let item of request) {
          let pdf: PdfFile = PdfStorage.instance.get(item.identifier);
          if (pdf && item.state < pdf.state) randomRequest.push({ identifier: item.identifier, state: item.state });
        }

        if (this.isLimitSendTask() === false && 0 < randomRequest.length && !this.existsSendTask(event.data.receiver)) {
          // 送信
          let updatePdfs: PdfContext[] = this.makeSendUpdatePdfs(randomRequest);
          console.log('REQUEST_PDF_FILE_RESOURE PdfStorageService Send!!! ' + event.data.receiver + ' -> ' + updatePdfs.length);
          this.startSendTask(updatePdfs, event.data.receiver);
        } else {
          // 中継
          let candidatePeers: string[] = event.data.candidatePeers;
          let index = candidatePeers.indexOf(Network.peerId);
          if (-1 < index) candidatePeers.splice(index, 1);

          for (let peerId of candidatePeers) {
            console.log('REQUEST_PDF_FILE_RESOURE PdfStorageService Relay!!! ' + peerId + ' -> ' + event.data.identifiers);
            EventSystem.call(event, peerId);
            return;
          }
          console.log('REQUEST_PDF_FILE_RESOURE PdfStorageService あぶれた...' + event.data.receiver, randomRequest.length);
        }
      })
      .on('UPDATE_PDF_FILE_RESOURE', 1000, (event) => {
        let updatePdfs: PdfContext[] = event.data.updatePdfs;
        console.log('UPDATE_PDF_FILE_RESOURE PdfStorageService ' + event.sendFrom + ' -> ', updatePdfs);
        for (let context of updatePdfs) {
          if (context.blob) context.blob = new Blob([context.blob], { type: context.type });
          if (context.thumbnail.blob) context.thumbnail.blob = new Blob([context.thumbnail.blob], { type: context.thumbnail.type });
          PdfStorage.instance.add(context);
        }
      })
      .on('START_PDF_FILE_TRANSMISSION', (event) => {
        console.log('START_PDF_FILE_TRANSMISSION ' + event.data.taskIdentifier);
        let identifier = event.data.taskIdentifier;
        let pdf: PdfFile = PdfStorage.instance.get(identifier);
        if (this.receiveTaskMap.has(identifier) || (pdf && PdfState.COMPLETE <= pdf.state)) {
          console.warn('CANCEL_TASK_ ' + identifier);
          EventSystem.call('CANCEL_TASK_' + identifier, null, event.sendFrom);
        } else {
          this.startReceiveTask(identifier);
        }
      });
  }

  private destroy() {
    EventSystem.unregister(this);
  }

  private async startSendTask(updatePdfs: PdfContext[], sendTo: string) {
    let identifier = updatePdfs.length === 1 ? updatePdfs[0].identifier : UUID.generateUuid();
    let task = BufferSharingTask.createSendTask<PdfContext[]>(identifier, sendTo);
    this.sendTaskMap.set(task.identifier, task);
    EventSystem.call('START_PDF_FILE_TRANSMISSION', { taskIdentifier: identifier }, sendTo);

    /* hotfix issue #1 */
    for (let context of updatePdfs) {
      if (context.thumbnail.blob) {
        context.thumbnail.blob = <any>await FileReaderUtil.readAsArrayBufferAsync(context.thumbnail.blob);
      } else if (context.blob) {
        context.blob = <any>await FileReaderUtil.readAsArrayBufferAsync(context.blob);
      }
    }
    /* */

    task.onfinish = (task, data) => {
      this.stopSendTask(task.identifier);
      PdfStorage.instance.synchronize();
    };

    task.start(updatePdfs);
  }

  private startReceiveTask(identifier: string) {
    let task = BufferSharingTask.createReceiveTask<PdfContext[]>(identifier);
    this.receiveTaskMap.set(identifier, task);
    task.onfinish = (task, data) => {
      this.stopReceiveTask(task.identifier);
      if (data) EventSystem.trigger('UPDATE_PDF_FILE_RESOURE', { identifier: task.identifier, updatePdfs: data });
      PdfStorage.instance.synchronize();
    };

    task.start();
    console.log('startReceiveTask => ', this.receiveTaskMap.size);
  }

  private stopSendTask(identifier: string) {
    let task = this.sendTaskMap.get(identifier);
    if (task) {
      task.cancel();
    }
    this.sendTaskMap.delete(identifier);

    console.log('stopSendTask => ', this.sendTaskMap.size);
  }

  private stopReceiveTask(identifier: string) {
    let task = this.receiveTaskMap.get(identifier);
    if (task) {
      task.cancel();
    }
    this.receiveTaskMap.delete(identifier);

    console.log('stopReceiveTask => ', this.receiveTaskMap.size);
  }

  private request(request: CatalogItem[], peerId: string) {
    console.log('requestFile() ' + peerId);
    let peerIds = Network.peerIds;
    peerIds.splice(peerIds.indexOf(Network.peerId), 1);
    EventSystem.call('REQUEST_PDF_FILE_RESOURE', { identifiers: request, receiver: Network.peerId, candidatePeers: peerIds }, peerId);
  }

  private makeSendUpdatePdfs(catalog: CatalogItem[], maxSize: number = 1024 * 1024 * 0.5): PdfContext[] {
    let updatePdfs: PdfContext[] = [];
    let byteSize: number = 0;

    // Fisher-Yates
    for (let i = catalog.length - 1; 0 <= i; i--) {
      let rand = Math.floor(Math.random() * (i + 1));
      [catalog[i], catalog[rand]] = [catalog[rand], catalog[i]];
    }

    catalog.sort((a, b) => {
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;
      return 0;
    });

    for (let i = 0; i < catalog.length; i++) {
      let item: { identifier: string; state: number } = catalog[i];
      let pdf: PdfFile = PdfStorage.instance.get(item.identifier);

      let context: PdfContext = {
        identifier: pdf.identifier,
        name: pdf.name,
        type: '',
        blob: null,
        url: null,
        thumbnail: { type: '', blob: null, url: null },
      };

      if (pdf.state === PdfState.URL) {
        context.url = pdf.url;
      } else if (item.state === PdfState.NULL) {
        context.thumbnail.blob = pdf.thumbnail.blob; //
        context.thumbnail.type = pdf.thumbnail.type;
      } else {
        context.blob = pdf.blob; //
        context.type = pdf.blob.type;
      }

      let size = context.blob ? context.blob.size : context.thumbnail.blob ? context.thumbnail.blob.size : 100;

      updatePdfs.push(context);
      byteSize += size;
      if (maxSize < byteSize) break;
    }
    return updatePdfs;
  }

  private hasActiveTask(): boolean {
    return 0 < this.sendTaskMap.size || 0 < this.receiveTaskMap.size;
  }

  private isLimitSendTask(): boolean {
    return this.maxSendTask <= this.sendTaskMap.size;
  }

  private isLimitReceiveTask(): boolean {
    return this.maxReceiveTask <= this.receiveTaskMap.size;
  }

  private existsSendTask(peerId: string): boolean {
    for (let task of this.sendTaskMap.values()) {
      if (task && task.sendTo === peerId) return true;
    }
    return false;
  }
}

function convertUrlPdf(xmlElement: Element) {
  let urls: string[] = [];

  let pdfElements = xmlElement.querySelectorAll('*[type="pdf"]');
  for (let i = 0; i < pdfElements.length; i++) {
    let url = pdfElements[i].innerHTML;
    if (!PdfStorage.instance.get(url) && 0 < MimeType.type(url).length) {
      urls.push(url);
    }
  }

  pdfElements = xmlElement.querySelectorAll('*[pdfIdentifier]');
  for (let i = 0; i < pdfElements.length; i++) {
    let url = pdfElements[i].getAttribute('pdfIdentifier');
    if (!PdfStorage.instance.get(url) && 0 < MimeType.type(url).length) {
      urls.push(url);
    }
  }
  for (let url of urls) {
    PdfStorage.instance.add(url);
  }
}
