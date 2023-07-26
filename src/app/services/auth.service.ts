import { Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "@angular/fire/auth";
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public uid: string | null = null;
    public uidChanged = new Subject<string | null>();

    constructor(private auth: Auth) {
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
            return userCredential;
        } catch (e) {
            console.error("Error during login:", e);
            return null;
        }
    }

    logout() {
        this.uid = null;
        this.uidChanged.next(null); // Emitir o evento
        return signOut(this.auth);
    }

    private authStateCheck() {
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.uid = user.uid;
                this.uidChanged.next(this.uid);
            } else {
                this.uid = null;
                this.uidChanged.next(null);
            }
        });
    }
}
