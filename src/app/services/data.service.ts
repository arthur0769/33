import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc } from "@angular/fire/firestore";
import { ProviderId } from "firebase/auth";
import { collection } from "firebase/firestore";

export interface Cards {
    id?: string;
    pergunta: string
    resposta: string
}

@Injectable({
    providedIn: 'root'
})

export class DataService {

    constructor(private firestore: Firestore) {}

    getCards() {
        const cardsRef = collection(this.firestore, 'cards');
        return collectionData(cardsRef);
    }

    addCards(cards: Cards) {
      const cardsRef = collection(this.firestore, 'cards');
      return addDoc(cardsRef, cards);
    }

}