import { Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "@angular/fire/auth";
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public uid: string | null = null;
    public uidChanged = new Subject<string | null>();  // Adicionar este Subject

    constructor(private auth: Auth) {}

    async register({ email, password }: { email: string, password: string }): Promise<UserCredential | null> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            this.uid = userCredential.user.uid;
            this.uidChanged.next(this.uid);  // Emitir o evento
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
            this.uidChanged.next(this.uid);  // Emitir o evento
            return userCredential;
        } catch (e) {
            console.error("Error during login:", e);
            return null;
        }
    }

    logout() {
        this.uid = null;
        return signOut(this.auth);
    }
}
