import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc, getDocs, getDoc } from "@angular/fire/firestore";
import { DocumentSnapshot, and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import { map, retry } from 'rxjs/operators';
import { Observable, from } from "rxjs";
import { AuthService } from './auth.service';  // Não esqueça de importar o AuthService
import { of } from 'rxjs';

export interface Cards {
    id?: string;
    uid?: string | null;
    pergunta: string;
    resposta: string;
    data: any;
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    db: any

    constructor(private firestore: Firestore, private authService: AuthService) {  // Injete o AuthService
        this.db = firestore;
    }
    

    getCards() {
        const cardsRef = collection(this.firestore, 'cards');
        const queryRef = query(cardsRef, where('uid', '==', this.authService.uid));
        return collectionData(queryRef);
    }

    getCardsHoje() {
        const id = this.authService.uid
        const agora = new Date();
        const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const fimDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
        const cardsRef = collection(this.firestore, 'cards');
        const queryRef = query(
          cardsRef, 
          where('uid', '==', id),
          where('data', '>=', inicioDoDia),
          where('data', '<', fimDoDia)
        );
        return collectionData(queryRef, {idField: 'id'}).pipe(
            map(cards => cards as {id: string, data: Cards}[])
        );
    }

    addCards(cards: Cards) {
        cards.uid = this.authService.uid;  
        const cardsRef = collection(this.firestore, 'cards');
        return addDoc(cardsRef, cards);
    }

    updateCardData(id: string, oldData: any, dias: number): Observable<any> {
        const novaData = new Date(oldData.seconds * 1000 + oldData.nanoseconds / 1000000);
        novaData.setDate(novaData.getDate() + dias);
    
        const cardRef = doc(this.firestore, 'cards', id);
        return from(setDoc(cardRef, { data: novaData }, { merge: true }));
    }
}
