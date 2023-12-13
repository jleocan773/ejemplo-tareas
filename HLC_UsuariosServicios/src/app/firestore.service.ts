import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
//npm install firebase @angular/fire --save IMPORTANTE PARA INSTALAR FIREBASE

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private angularFirestore: AngularFirestore) { }

  public insertar(coleccion:string, datos:any){
    return this.angularFirestore.collection(coleccion).add(datos)
  }

}
