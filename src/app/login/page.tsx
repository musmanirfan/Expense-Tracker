"use client"

import React from 'react'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from '../firebase/firebaseConfig';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bounce, toast } from 'react-toastify';

export interface ErrorType {
    code?: string;
    message?: string;
    // other properties...
  }


export default function Login() {
    const auth = getAuth(app);
    const route = useRouter();


    const login = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            const { fromEntries } = Object
            const formOutput = new FormData(e.target as HTMLFormElement)
            const obj = fromEntries(formOutput.entries())

            if (typeof obj.email === 'string' && typeof obj.password === "string") {
                const user = await signInWithEmailAndPassword(auth, obj.email, obj.password)
                console.log("YE WALA", user);
            }

        } catch (error) {
            const errorMessage = (error as ErrorType)?.code || 'An unexpected error occurred';
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
            });
            console.log(error);
        }
    }

    const forget = () => {
        route.push('/forgetPassword');
    }

    return (
        <div>

            <div className="flex items-center justify-center min-h-screen bg-green-100">
                <div className="bg-card !px-6 p-10 rounded-lg shadow-md w-80 bg-white">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Welcome back!</h2>
                    <p className="text-muted-foreground mb-4">Log in to access your account.</p>
                    <form onSubmit={login}>
                        <input required className='border border-border rounded-lg p-2 mb-4 w-full' type="email"
                            name='email'
                            placeholder='Email' />
                        <input required className='border border-border rounded-lg p-2 mb-4 w-full' type="password"
                            name='password'
                            placeholder='Password' />
                        <button className='bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg p-2 w-full' type='submit'>Login</button>
                    </form>
                    <button className='bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg underline text-red-600 p-2 w-full' onClick={forget}>Forget Password</button>
                    <p className="text-muted-foreground text-center mt-4">
                        Not a member? <Link className='underline text-blue-700' href={'/signup'}>Signup here
                        </Link>
                    </p>
                </div>
            </div >
        </div>
    )
}
