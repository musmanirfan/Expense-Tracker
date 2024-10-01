"use client"

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';

type userType = {
    email: string | null,
    uid: string,
    emailVerified: boolean,
}

// type todoType = {
//     id:string
//     todo: string;
//     isComplete: boolean;
// }

type ExpenseTracker = {
    id: string;
    title: string;
    amount: number;
    catogery: string;
    date: Date;
    note: string;
}

type AuthContextProviderType = {
    children: ReactNode
}

type authContexType = {
    user: userType | null
    userName: string
    expenseTracker: ExpenseTracker[];
    // todoData: todoType[];

}

const AuthContext = createContext<null | authContexType>(null)

export default function AuthContextProvider({ children }: AuthContextProviderType) {
    const [user, setUser] = useState<null | userType>(null);
    const [userName, setUserName] = useState<string>("");
    // const [todoData, setTodoData] = useState<todoType[]>([]);
    const [expenseTracker, setExpenseTracker] = useState<ExpenseTracker[]>([])
    const router = useRouter();

    // useEffect(() => console.log(expenseTracker), [expenseTracker])
    useEffect(() => {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const { email, uid, emailVerified } = user;
                setUser({ email, uid, emailVerified });
                // console.log(user, "inside on auth change");

                if (emailVerified) {
                    // console.log("start");
                    (async () => {
                        try {
                            console.log("Fetching user data for UID:", uid);
                            const userDoc = doc(db, "users", uid);
                            const docSnap = await getDoc(userDoc);
                            console.log(docSnap?.data());
                            
                            if (docSnap?.exists()) {
                                const fetchedUserName = docSnap.data().user_name;
                                setUserName(fetchedUserName);
                                console.log(fetchedUserName);

                                // console.log(fetchedUserName);
                            } else {
                                // console.log("No such document!");
                            }
                        } catch (error) {
                            console.error("Error fetching user name:", error);
                        }
                    })();
                    (async () => {
                        const expenseDocs = collection(db, "expenses")
                        const currentUserId = auth.currentUser?.uid;

                        const condition = where("uid", "==", currentUserId)
                        const q = query(expenseDocs, condition)

                        try {
                            const allTodosSnapShot = await getDocs(q);
                            allTodosSnapShot.forEach((expense) => {
                                const expenseList = expense.data() as ExpenseTracker;
                                expenseList.id = expense.id;
                                // console.log(expenseList);
                                setExpenseTracker(prevexpense => [...prevexpense, expenseList]);
                            })
                        } catch (e) {
                            console.log(e);
                        }
                    })();
                    router.push('/');

                } else {
                    router.push('/verifyEmail');
                }
            } else {
                setUser(null);
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, userName, expenseTracker }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuthContext = () => useContext(AuthContext);
