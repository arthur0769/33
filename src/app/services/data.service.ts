import { Injectable } from "@angular/core";
import { Firestore, collectionData } from "@angular/fire/firestore";
import { ProviderId } from "firebase/auth";
import { collection } from "firebase/firestore";

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(private firestore: Firestore) {}

    getNotes() {
        const notesRef = collection(this.firestore, 'cards');
        return collectionData(notesRef);
    }
}