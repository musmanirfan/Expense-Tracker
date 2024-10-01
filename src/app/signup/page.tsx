"use client"

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import { app } from "../firebase/firebaseConfig";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { Bounce, toast } from "react-toastify";
import { ErrorType } from "../login/page";


// type userType = {
//     user_name: string,
//     email: string,
//     password: string,
//     uid: string,
// }


export default function Signup() {
    const route = useRouter()
    const auth = getAuth(app);
    const db = getFirestore(app);
    const signup = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            console.log("inside signup");

            const { fromEntries } = Object
            const formOutput = new FormData(e.target as HTMLFormElement)
            const obj = fromEntries(formOutput.entries())
            // console.log(formOutput, "this is formOutput");
            // console.log(obj, "this is in obj");
            console.log(typeof obj.email, typeof obj.password, typeof obj.user_name);


            if (typeof obj.email === 'string' &&
                typeof obj.password === "string" &&
                typeof obj.user_name === "string") {
                console.log("start");

                const user = await createUserWithEmailAndPassword(auth, obj.email, obj.password)
                console.log("user created");
                if (auth.currentUser) {
                    await sendEmailVerification(auth.currentUser)
                    console.log(user);
                    const docRef = doc(db, "users", auth.currentUser.uid)
                    console.log("dasfsdfsfsafsadfasgsghreaerasfawetsad");
                    
                    await setDoc(docRef, { user_name: obj.user_name, uid: auth.currentUser.uid, email:user.user.email })
                    route.push("/verifyEmail")
                }
            }

        } catch (error) {
            const errorMessage = (error as ErrorType)?.code 
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            })
            console.log("catch");
            
        }
    }
    return (
        <div className="flex w-full items-center h-[100vh] bg-green-100">
            <div className="max-w-md mx-auto px-6 py-10 bg-card rounded-lg shadow-lg bg-white">
                <h2 className="text-2xl font-bold text-foreground">Join us today!</h2>
                <p className="text-muted-foreground mb-4">Sign up now to become a member.</p>
                <form onSubmit={signup}>
                    <div className="mb-4">
                        <input required className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring focus:ring-ring" type="text" name="user_name" placeholder="Name" /> <br />
                    </div>
                    <div className="mb-4">
                        <input required className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring focus:ring-ring" type="email" name="email" placeholder="Email" /> <br />
                    </div>
                    <div className="mb-4">
                        <input required className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring focus:ring-ring" type="password" name="password" placeholder="Password" /> <br />
                    </div>
                    <button className="w-full bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/80" type="submit">SignUp</button>
                </form>
                <p className="text-center text-muted-foreground mt-4">Already a member? <Link className="underline text-blue-700" href={'/login'}>Login Here</Link></p>
            </div>
        </div>
    )
}
