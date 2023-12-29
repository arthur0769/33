import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc, getDocs, getDoc } from "@angular/fire/firestore";
import { DocumentSnapshot, and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import { map, retry } from 'rxjs/operators';
import { Observable, from } from "rxjs";
import { AuthService } from './auth.service';
import { of } from 'rxjs';

export interface Cards {
    editando: boolean;
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


    


    importarCardsDoAnki(arquivo: File): Promise<void> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
    
          reader.onload = (event) => {
            try {
              const conteudo: string = (event.target as FileReader).result as string;
              const cardsDoAnki: any[] = JSON.parse(conteudo);
    
              if (Array.isArray(cardsDoAnki)) {
                // Mapeie os dados do Anki para o formato do seu aplicativo, por exemplo:
                const cardsFormatados: Cards[] = cardsDoAnki.map(cardAnki => {
                  return {
                    editando: false,
                    assunto: cardAnki.assunto,
                    pergunta: cardAnki.pergunta,
                    resposta: cardAnki.resposta,
                    data: this.convertDateToFirebaseTimestamp(new Date()) // Adapte conforme necessário
                    // ... outros campos ou lógica conforme necessário
                  };
                });
    
                // Adicione os cards formatados ao Firebase ou onde você armazena os dados
                cardsFormatados.forEach(card => {
                  this.addCards(card).then(() => {
                    console.log("Card do Anki importado com sucesso!");
                  });
                });
    
                resolve();
              } else {
                reject(new Error("Arquivo do Anki inválido."));
              }
            } catch (error) {
              reject(error);
            }
          };
    
          reader.readAsText(arquivo);
        });
      }












    atualizarCard(card: Cards): Promise<void> {
        const { id, ...cardData } = card; // Removendo a propriedade 'id' da card
        
        if (id) {
            const cardRef = doc(this.db, 'cards', id);
            return setDoc(cardRef, cardData, { merge: true });
        } else {
            return Promise.reject(new Error('ID inválido')); // Retorna uma Promise rejeitada se o ID for inválido
        }
    }
    
    db: any;

    constructor(private firestore: Firestore, private authService: AuthService) {
        this.db = firestore;

        this.authService.uidChanged.subscribe((uid) => {
            if (uid) {
                this.syncLocalCardsWithFirebase();
            }
        });
    }

    getCards(): Observable<Cards[]> {
      const cardsRef = collection(this.firestore, 'cards');
      const queryRef = query(cardsRef, where('uid', '==', this.authService.uid));
      
      // Recupera os cards do armazenamento local
      const localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
      
      return collectionData(queryRef, { idField: 'id' }).pipe(
        map(cards => {
          // Combina os cards do Firestore com os cards do armazenamento local
          return [...cards, ...localCards] as Cards[];
        })
      );
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
          where('data', '<', fimDoDiaISO),
          where('assunto', '==', assunto)
        );
        return collectionData(queryRef, { idField: 'id' }).pipe(
          map(cards => cards as { id: string, data: Cards, assunto: string }[])
        );
      } else {
        let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
        
        // Filtrar os cartões locais por data e assunto
        const cartoesFiltrados = localCards.filter((card: Cards) => {
          const cardDate = new Date(card.data);
          return cardDate >= inicioDoDia && cardDate < fimDoDia && card.assunto === assunto;
        });
        
        // Mapear os cartões filtrados para retornar com ID, dados e assunto
        const cartoesMapeados = cartoesFiltrados.map((card: Cards) => ({
          id: card.id || '', // Garante que o ID está presente ou define como string vazia
          data: card,
          assunto: card.assunto,
          pergunta: card.pergunta,
          resposta: card.resposta
        }));
    
        return new Observable(observer => {
          // Retorne os cartões filtrados com ID, dados e assunto
          observer.next(cartoesMapeados);
          observer.complete();
        });
      }
    }
     
    
     
      
      

    async hasCards(uid: string): Promise<boolean> {
        const cardsRef = collection(this.firestore, "cards");
        const queryRef = query(cardsRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(queryRef);
        return !querySnapshot.empty;
      }


    async getCardCountByUser(uid: string): Promise<number> {
      const cardsRef = collection(this.firestore, 'cards');
      const queryRef = query(cardsRef, where('uid', '==', uid));
      const querySnapshot = await getDocs(queryRef);
      return querySnapshot.size; // Retorna o número de cartas
  }

  
    
  addCards(cards: Cards) {
    const isoDate = new Date().toISOString();
    cards.data = isoDate;
   
    if (this.authService.uid) {
      cards.uid = this.authService.uid;
      return this.getCardCountByUser(this.authService.uid).then((count) => {
        if (count < 10) {
          const cardsRef = collection(this.firestore, 'cards');
          return addDoc(cardsRef, cards).then(() => {
            console.log("Card adicionado em:", this.formatTimestampToReadableDate(cards.data));
          });
        } else {
          console.log("Limite de cards atingido");
          return Promise.reject("Limite de cards atingido");
        }
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

    updateCard(card: Cards): Promise<void> {
        const { id, ...cardData } = card; // Removendo a propriedade 'id' da card
        
        if (id) {
            const cardRef = doc(this.db, 'cards', id); // Adicione o ID como o segundo argumento
            return setDoc(cardRef, cardData, { merge: true });
        } else {
            // Lide com o caso em que o ID é undefined ou null
            return Promise.reject(new Error('ID inválido'));
        }
    }


    excluirCard(card: Cards) {
      return this.db.collection('cards').doc(card.id).delete();
     }     
     
      
      
}