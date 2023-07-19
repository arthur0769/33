import { Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from "@angular/fire/auth";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public uid: string | null = null;

    constructor(private auth: Auth) {}

    async register({ email, password }: { email: string, password: string }): Promise<UserCredential | null> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            this.uid = userCredential.user.uid; // Armazenando o uid após o registro bem-sucedido
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
            this.uid = userCredential.user.uid; // Armazenando o uid após o login bem-sucedido
            return userCredential;
        } catch (e) {
            console.error("Error during login:", e);
            return null;
        }
    }

    logout() {
        this.uid = null; // Limpando o uid após o logout
        return signOut(this.auth);
    }
}
