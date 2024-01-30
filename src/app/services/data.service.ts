import { Injectable } from "@angular/core";
import { Firestore, collectionData, addDoc, setDoc, doc, getDocs, getDoc, deleteDoc } from "@angular/fire/firestore";
import { DocumentSnapshot, and, collection } from "firebase/firestore";
import { query, where } from 'firebase/firestore';
import { map, retry } from 'rxjs/operators';
import { Observable, from, observable } from "rxjs";
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

    constructor(
      private firestore: Firestore, 
      private authService: AuthService,
      ) {
        this.db = firestore;

        this.authService.uidChanged.subscribe((uid) => {
            if (uid) {
                this.syncLocalCardsWithFirebase();
            }
        });
    }



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
                  data: this.convertDateToString(new Date()) // Adapte conforme necessário
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







    isValidISODate(str: string) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      return regex.test(str);
    }    

    getCards(assunto: string): Observable<Cards[]> {
      const cardsRef = collection(this.firestore, 'cards');
      const queryRef = query(cardsRef, where('uid', '==', this.authService.uid));
     
      // Recupera os cards do armazenamento local
      const localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
     
      return collectionData(queryRef, { idField: 'id' }).pipe(
        map(cards => {
          // Combina os cards do Firestore com os cards do armazenamento local
          let allCards = [...cards, ...localCards] as Cards[];
     
          // Aplica a filtragem
          if (assunto !== '') {
            allCards = allCards.filter(card => card.assunto === assunto);
          }
     
          return allCards;
        })
      );
     }
      

     convertDateToString(date: Date): string {
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
          return cardDate < fimDoDia && card.assunto === assunto;
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
        const cardsRef = collection(this.firestore, 'cards');
        const queryRef = query(cardsRef, where("uid", "==", uid));
        const querySnapshot = await getDocs(queryRef);
        return !querySnapshot.empty;
      }


      //usar esta com a skeleton

      async getCardCountByUser(id: any) {

        let count = 0;

        // Verifique se o usuário está logado
        if (this.authService.uid) {
           // Se o usuário estiver logado, busque os cards do Firestore
           const cardsRef = collection(this.firestore, 'cards');
           const queryRef = query(cardsRef, where('uid', '==', id));
           const querySnapshot = await getDocs(queryRef);
           count += querySnapshot.size;
        } else {
           // Se o usuário não estiver logado, busque os cards locais
           const localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
           count += localCards.length;
        }
       
        console.log(count)
        return count;
       }       
       
       

  
    
  addCards(cards: Cards) {
    const isoDate = this.convertDateToString(new Date()); // Obtém a data no formato ISO 8601
    cards.data = isoDate;
   
    if (this.authService.uid) {
      cards.uid = this.authService.uid;
      return this.getCardCountByUser(this.authService.uid).then((count) => {
        if (count < 100000) { //valor limite simbolico, para utilização posterior
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

      const isoDate = this.convertDateToString(new Date()); // Obtém a data atual no formato ISO 8601 - não utilizando oldData

      if (!this.isValidISODate(oldData)) {
        throw new Error('Invalid ISO date');
      }
      const cardDate = this.timestampToDate(isoDate); // Converte a string ISO 8601 para objeto Date
    
      cardDate.setDate(cardDate.getDate() + dias);
    
      const formattedDate = this.convertDateToString(cardDate); // Converte de volta para string ISO 8601
    
      if (this.authService.uid) {
          const cardRef = doc(this.firestore, 'cards', id);
          return from(setDoc(cardRef, { data: formattedDate }, { merge: true }));
          // Atualização no Firebase usando a mesma formatação de data
      } else {
          let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
          const cardIndex = localCards.findIndex((card: { id: string; }) => card.id === id);
    
          if (cardIndex !== -1) {
              localCards[cardIndex].data = formattedDate; // Usando a mesma formatação de data
              localStorage.setItem('localCards', JSON.stringify(localCards));
          }
    
          return of({ success: true });
          // Atualização local com a mesma formatação de data
      }
    }
    
    updateLocalCardData(id: string, oldData: any, dias: number): void {

      const isoDate = this.convertDateToString(new Date()); // Obtém a data atual no formato ISO 8601 - não utilizando oldData
      
      let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
      const cardIndex = localCards.findIndex((card: { id: string }) => card.id === id);
    
      if (cardIndex !== -1) {
        const cardDate = this.timestampToDate(isoDate);
        console.log(cardDate)
        cardDate.setDate(cardDate.getDate() + dias);
        const formattedDate = this.convertDateToString(cardDate);
    
        localCards[cardIndex].data = formattedDate;
        localStorage.setItem('localCards', JSON.stringify(localCards));
        console.log(cardDate)
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

    deleteCard(id: any): Promise<void> {
      if (this.authService.uid) {
        const cardRef = doc(this.firestore, 'cards', id);
        return deleteDoc(cardRef);
      } else {
        let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
        const cardIndex = localCards.findIndex((card: { id: string; }) => card.id === id);
    
        if (cardIndex !== -1) {
          localCards.splice(cardIndex, 1); // Remove o card do array local
          localStorage.setItem('localCards', JSON.stringify(localCards));
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('ID inválido'));
        }
      }
    }

    async deleteCardsByAssunto(assunto: string): Promise<void> {
      const uid = this.authService.uid;
    
      if (uid) {
        await this.deleteFirebaseCards(uid, assunto);
        console.log(`Todas as cards do assunto "${assunto}" foram excluídas do Firestore com sucesso.`);
      } else {
        this.deleteLocalCards(assunto);
        console.log(`Todas as cards do assunto "${assunto}" foram excluídas localmente.`);
      }
    }
    
    private async deleteFirebaseCards(uid: string, assunto: string): Promise<void> {
      const cardsRef = collection(this.firestore, 'cards');
      const queryRef = query(cardsRef, where("uid", "==", uid), where("assunto", "==", assunto));
      const querySnapshot = await getDocs(queryRef);
    
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    }
    
    private deleteLocalCards(assunto: string): void {
      let localCards = JSON.parse(localStorage.getItem('localCards') || '[]');
      localCards = localCards.filter((card: Cards) => card.assunto !== assunto);
      localStorage.setItem('localCards', JSON.stringify(localCards));
    }
      
      
  
      
      
}