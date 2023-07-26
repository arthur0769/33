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

    convertDateToFirebaseTimestamp(date: Date) {
        const seconds = Math.floor(date.getTime() / 1000);
        const nanoseconds = (date.getTime() % 1000) * 1000000;
    
        return {
            seconds: seconds,
            nanoseconds: nanoseconds
        };
    }

    timestampToDate(timestamp: { seconds: number, nanoseconds: number }): Date {
        // Convertendo timestamp para objeto Date
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }

    convertedias(timestamp: { seconds: number, nanoseconds: number }): string {
        // Convertendo timestamp para objeto Date
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    
        // Formatando a data para "ano-mês-dia"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque os meses vão de 0 a 11
        const day = String(date.getDate()).padStart(2, '0');
    
        return `${year}-${month}-${day}`;
    }
    
       

    getCardsHoje(): Observable<{id: string, data: Cards}[]> {
        const id = this.authService.uid;
        const agora = new Date();
        const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        const fimDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
    
        // Convertendo datas para o formato de Timestamp do Firebase
        const inicioDoDiaTimestamp = this.convertDateToFirebaseTimestamp(inicioDoDia);
        const fimDoDiaTimestamp = this.convertDateToFirebaseTimestamp(fimDoDia);
        
        if (id) { // Se usuário estiver logado
            const cardsRef = collection(this.firestore, 'cards');
            const queryRef = query(
                cardsRef, 
                where('uid', '==', id),
                where('data', '>=', inicioDoDiaTimestamp),
                where('data', '<', fimDoDiaTimestamp)
            );
            return collectionData(queryRef, {idField: 'id'}).pipe(
                map(cards => cards as {id: string, data: Cards}[])
            );
        } else { // Se o usuário não estiver logado
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            
            // Filtrar cards por data
            const cardsHoje = localCards.filter((card: Cards) => {
                const cardDate = this.timestampToDate(card.data); 
                return cardDate >= inicioDoDia && cardDate < fimDoDia;
            });

            return of(cardsHoje); // Emitir os cards filtrados
        }
    }
    
    addCards(cards: Cards) {
        // Convert date to Firebase Timestamp format
        const timestamp = this.convertDateToFirebaseTimestamp(new Date());
    
        // Update the date in cards with the new format
        cards.data = timestamp;
    
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
    
        // Se estivermos trabalhando com dados do Firestore
        if (this.authService.uid) {
            const cardRef = doc(this.firestore, 'cards', id);
            return from(setDoc(cardRef, { data: novaData }, { merge: true }));
        } else {
            // Se estivermos trabalhando com dados locais
            let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
            const cardIndex = localCards.findIndex((card: { id: string; }) => card.id === id);
    
            if (cardIndex !== -1) {
                localCards[cardIndex].data = { 
                    seconds: Math.floor(novaData.getTime() / 1000), 
                    nanoseconds: (novaData.getTime() % 1000) * 1000000 
                };
                localStorage.setItem('localCards', JSON.stringify(localCards));
            }
    
            // Aqui, estamos apenas retornando um Observable de sucesso, visto que o armazenamento local não é assíncrono
            return of({ success: true });
        }
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
