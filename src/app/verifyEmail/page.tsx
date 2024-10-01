"use client"


import React from 'react'
import { getAuth, sendEmailVerification } from "firebase/auth";
import { app } from '../firebase/firebaseConfig';

export default function VerifyEmail() {

  const auth = getAuth(app);
  auth.currentUser?.email

  const verify = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser)
      }
    } catch (error) {
      console.log(error);

    }
  }

  return (
    <div className='bg-[#DCFCE7] min-h-screen flex items-center'>
      <div className="flex flex-col items-center justify-center min-h-fit p-10 rounded-xl bg-background sm:w-[50%] w-[80%] mx-auto">
        <h1 className="text-3xl font-bold text-foreground">Check your inbox</h1>
        <p className="mt-12 text-center text-muted-foreground">
          {` We are glad, that you’re with us 😊 We’ve sent you a verification link to the email address `}<span className="font-semibold">{auth.currentUser?.email}</span>.
        </p>
        <button className="mt-4 hover:bg-green-500 hover:text-white text-black border bg-white transition-all border-black hover:border-none w-[60%] py-2 rounded-lg" onClick={verify}>Sent Verification again</button>

      </div>
    </div>
  )
}
