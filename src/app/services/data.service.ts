import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc, getDocs, getDoc } from "@angular/fire/firestore";
import { DocumentSnapshot, and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import { map, retry } from 'rxjs/operators';
import { Observable, from } from "rxjs";
import { AuthService } from './auth.service';
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

    constructor(private firestore: Firestore, private authService: AuthService) {
        this.db = firestore;

        // Sincronizar os cards locais com o Firebase quando o usuário faz login
        this.authService.uidChanged.subscribe((uid) => {
            if (uid) {
                this.syncLocalCardsWithFirebase();
            }
        });
    }
    

    getCards() {
        const cardsRef = collection(this.firestore, 'cards');
        const queryRef = query(cardsRef, where('uid', '==', this.authService.uid));
        return collectionData(queryRef);
    }

    getCardsHoje(): Observable<{id: string, data: Cards}[]> {
        const id = this.authService.uid;
        if (id) { // Se usuário estiver logado
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
        } else { // Se o usuário não estiver logado
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            return of(localCards); // Emitir os cards locais
        }
    }

    
    addCards(cards: Cards) {
        if (this.authService.uid) {
            // If the user is logged in, add cards to Firestore
            cards.uid = this.authService.uid;
            const cardsRef = collection(this.firestore, 'cards');
            return addDoc(cardsRef, cards);
        } else {
            // If the user is not logged in, save cards to local storage
            const cardId = 'local_' + new Date().getTime(); // This creates a unique ID based on the current timestamp.
            cards.id = cardId;
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            localCards.push(cards);
            localStorage.setItem('localCards', JSON.stringify(localCards));
            return Promise.resolve(); // Return a resolved promise for consistency
        }
    }

    updateCardData(id: string, oldData: any, dias: number): Observable<any> {
        const novaData = new Date(oldData.seconds * 1000 + oldData.nanoseconds / 1000000);
        novaData.setDate(novaData.getDate() + dias);
    
        const cardRef = doc(this.firestore, 'cards', id);
        return from(setDoc(cardRef, { data: novaData }, { merge: true }));
    }

    private syncLocalCardsWithFirebase() {
        let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
        
        if (localCards.length > 0) {
            localCards.forEach((card: Cards) => {
                // Remove the local ID before adding to Firestore
                delete card.id;
                this.addCards(card);
            });

            // Clear local storage after syncing
            localStorage.removeItem('localCards');
        }
    }
}
