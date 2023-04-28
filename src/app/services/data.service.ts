import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc } from "@angular/fire/firestore";
import { ProviderId } from "firebase/auth";
import { and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';

export interface Cards {
    id?: string;
    pergunta: string
    resposta: string
    data: string
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

    atualizarCard(id: string, novasInformacoes: Cards) {
        if (!novasInformacoes || !novasInformacoes.pergunta) {
          console.error('As novas informações estão vazias ou nulas!');
          return null;
        }
        const cardsRef = doc(this.firestore, 'cards', id);
        return setDoc(cardsRef, novasInformacoes, { merge: true });
      }
      
      
      


}
