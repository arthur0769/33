import { Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, sendPasswordResetEmail } from "@angular/fire/auth";
import { Subject } from 'rxjs';
import { SharedService } from '../services/SharedService';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public uid: string | null = null;
    public uidChanged = new Subject<string | null>();
    public email: string | null = null;

    constructor(
        private sharedService: SharedService,
        private auth: Auth
        ) {
        this.authStateCheck();
    }

    async register({ email, password }: { email: string, password: string }): Promise<UserCredential | null> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            this.uid = userCredential.user.uid;
            this.uidChanged.next(this.uid);
            this.email = userCredential.user.email;
            return userCredential;
        } catch (e) {
            console.error("Error during registration:", e);
            return null;
        }
    }

    async login({ email, password }: { email: string, password: string }): Promise<UserCredential | null> {
        try {
            const userCredential = await signInWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            this.uid = userCredential.user.uid;
            this.uidChanged.next(this.uid);
            this.email = userCredential.user.email;
            return userCredential;
        } catch (e) {
            console.error("Error during login:", e);
            return null;
        }
    }

    logout() {
        this.uid = null;
        this.uidChanged.next(null); // Emitir o evento
        this.sharedService.refreshCards();
        return signOut(this.auth);
    }


    authStateCheck() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.uid = user.uid;
                this.uidChanged.next(this.uid);
                this.email = user.email;
                this.sharedService.refreshCards();
            } else {
                this.uid = null;
                this.uidChanged.next(null);
                this.email = null;
                this.sharedService.refreshCards();
            }
        });
        
    }


    async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(this.auth, email);
            // A redefinição de senha foi enviada com sucesso
        } catch (error) {
            console.error("Error during password reset:", error);
            throw error; // Você pode lidar com o erro de outra forma, se necessário
        }
    }
}
