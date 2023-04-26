import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc } from "@angular/fire/firestore";
import { ProviderId } from "firebase/auth";
import { collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';

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

    getCardsHoje() {
        const cardsRef = collection(this.firestore, 'cards');
        const hoje = new Date();
        const data = `${hoje.getDate()}-${hoje.getMonth() + 1}-${hoje.getFullYear()}`;
        const q = query(cardsRef, where('data', '==', data));
        return collectionData(q);
      }

    addCards(cards: Cards) {
      const cardsRef = collection(this.firestore, 'cards');
      return addDoc(cardsRef, cards);
    }

}