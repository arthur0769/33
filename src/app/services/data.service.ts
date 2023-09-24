import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc, getDocs, getDoc } from "@angular/fire/firestore";
import { DocumentSnapshot, and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import { map, retry } from 'rxjs/operators';
import { Observable, from } from "rxjs";
import { AuthService } from './auth.service';
import { of } from 'rxjs';

export interface Cards {
    assunto: string;
    id?: string;
    uid?: string | null;
    pergunta: string;
    resposta: string;
    data: string; // Mudado para string (formato ISO)
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    db: any;

    constructor(private firestore: Firestore, private authService: AuthService) {
        this.db = firestore;

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

    convertDateToFirebaseTimestamp(date: Date): string {
        return date.toISOString();
    }

    timestampToDate(isoDate: string): Date {
        return new Date(isoDate);
    }

    formatTimestampToReadableDate(isoDate: string): string {
        const date = this.timestampToDate(isoDate);
        
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
            hour12: false
        };        
    
        return new Intl.DateTimeFormat('pt-BR', options).format(date);
    }

    getCardsHoje(assunto: string): Observable<{ id: string; data: Cards; assunto: string }[]> {
        const id = this.authService.uid;
        const agora = new Date();
        const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const fimDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
    
        const inicioDoDiaISO = inicioDoDia.toISOString();
        const fimDoDiaISO = fimDoDia.toISOString();
        
        if (id) {
            const cardsRef = collection(this.firestore, 'cards');
            const queryRef = query(
                cardsRef, 
                where('uid', '==', id),
                where('data', '>=', inicioDoDiaISO),
                where('data', '<', fimDoDiaISO)
            );
            return collectionData(queryRef, {idField: 'id'}).pipe(
                map(cards => cards as {id: string, data: Cards, assunto: string}[])
            );
        } else {
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            
            const cardsHoje = localCards.filter((card: Cards) => {
                const cardDate = this.timestampToDate(card.data); 
                return cardDate >= inicioDoDia && cardDate < fimDoDia;
            });
    
            return of(cardsHoje);
        }
    }    

    async hasCards(uid: string): Promise<boolean> {
        const cardsRef = collection(this.firestore, "cards");
        const queryRef = query(cardsRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(queryRef);
        return !querySnapshot.empty;
      }
    
    
    addCards(cards: Cards) {
        const isoDate = new Date().toISOString();
        cards.data = isoDate;
    
        if (this.authService.uid) {
            cards.uid = this.authService.uid;
            const cardsRef = collection(this.firestore, 'cards');
            return addDoc(cardsRef, cards).then(() => {
                console.log("Card adicionado em:", this.formatTimestampToReadableDate(cards.data));
            });
        } else {
            const cardId = 'local_' + new Date().getTime();
            cards.id = cardId;
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            localCards.push(cards);
            localStorage.setItem('localCards', JSON.stringify(localCards));
            
            console.log("Card armazenado localmente em:", this.formatTimestampToReadableDate(cards.data));
            return Promise.resolve();
        }
    }
    

    private syncLocalCardsWithFirebase() {
        let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');

        if (localCards.length > 0) {
            localCards.forEach((card: Cards) => {
                delete card.id;
                this.addCards(card).then(() => {
                    console.log("Card sincronizado em:", this.formatTimestampToReadableDate(card.data));
                });
            });
            localStorage.removeItem('localCards');
        }
    }

    updateCardData(id: string, oldData: string, dias: number): Observable<any> {
        const novaData = new Date(oldData);
        novaData.setDate(novaData.getDate() + dias);
    
        if (this.authService.uid) {
            const cardRef = doc(this.firestore, 'cards', id);
            return from(setDoc(cardRef, { data: novaData.toISOString() }, { merge: true }));
        } else {
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            const cardIndex = localCards.findIndex((card: { id: string; }) => card.id === id);
    
            if (cardIndex !== -1) {
                localCards[cardIndex].data = novaData.toISOString();
                localStorage.setItem('localCards', JSON.stringify(localCards));
            }
    
            return of({ success: true });
        }
    }    
}