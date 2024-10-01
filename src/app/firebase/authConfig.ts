/* import { getAuth} from "firebase/auth";
import { app } from "./firebaseConfig";

const auth = getAuth(app); */
/* export const signup = (name:string, email:string, password:string) => {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const {uid, email, emailVerified} = userCredential.user;
            console.log(uid,email,emailVerified, "user signup");

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            // ..
        });
} */