"use client"

import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import React, { useState } from 'react'
import { app } from '../firebase/firebaseConfig'
import { Bounce, toast } from 'react-toastify'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'

export default function ForgetPassword() {
    const [showForm, setShowForm] = useState(true)
    const auth = getAuth(app);
    const db = getFirestore(app);
    const forget = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { fromEntries } = Object
        const formOutput = new FormData(e.target as HTMLFormElement)
        const obj = fromEntries(formOutput.entries()) as { email: string }
        try {
            const userRef = collection(db, "users")
            const q = query(userRef, where("email", "==", obj.email))
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty){
                await sendPasswordResetEmail(auth, obj.email)
                setShowForm(false)
            }else{
                toast.error("Invalid Email 🤦‍♂️", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            }

            console.log("yhn chla");
        }
        catch (e) {
            console.log("catch main chla");

            console.log(e);
        };

    }
    return (

        <>
            {
                showForm ? (
                    <>
                        < div className="flex items-center justify-center min-h-screen bg-green-100">
                            <div className="bg-card !px-6 p-10 rounded-lg shadow-md w-80 bg-white">
                                <h2 className="text-2xl font-bold text-foreground mb-4">Forget Password</h2>
                                <p className="text-muted-foreground mb-4">Enter Your Signup Email</p>
                                <form onSubmit={forget}>
                                    <input required className='border border-border rounded-lg p-2 mb-4 w-full' type="email"
                                        name='email'
                                        placeholder='Email' />
                                    <button className='bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg p-2 w-full' type='submit'>Forget Password</button>
                                </form>
                            </div>
                        </div >
                    </>
                ) : < div className="flex items-center justify-center min-h-screen bg-green-100">
                    <div className="bg-card !px-6 p-10 rounded-lg shadow-md w-80 bg-white">
                        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Check Your Email To Reset Password</h2>
                    </div>
                </div >
            }
        </>

    )
}
