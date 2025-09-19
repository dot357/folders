import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export type FolderRow = [id: number, title: string, parent_id: number | null];
export type ItemRow   = [id: number, title: string, folder_id: number];


export interface Table<T extends any[]> {
  columns: string[];
  data: T[];
}


export interface ResponseData {
  folders: Table<FolderRow>;
  items: Table<ItemRow>;
}


@Injectable({ providedIn: 'root' })
export class ResponseService {
  private base = window.location.origin; 

  constructor(private http: HttpClient) {}

  getResponse(): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${this.base}/response.json`);
  }
}
