"use client";

import React, { useState, useEffect } from "react";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    Unsubscribe,
} from "firebase/auth";
import {
    addDoc,
    collection,
    getFirestore,
    query,
    where,
    deleteDoc,
    doc,
    DocumentData,
    onSnapshot,
} from "firebase/firestore";
import { app } from "@/app/firebase/firebaseConfig"; // Firebase config import
import Header from "./header"; // Import Header Component
import { Delete,Edit } from "@mui/icons-material";
import { Bounce, toast } from "react-toastify";

export default function ShowExpenses() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    // State variables for expense form
    const [expenseTitle, setExpenseTitle] = useState<string>("");
    const [expenseAmount, setExpenseAmount] = useState<number | undefined>(
        undefined
    );
    const [expenseCategory, setExpenseCategory] = useState<string>("");
    const [expenseDate, setExpenseDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    ); // Current date as string
    const [expenseNote, setExpenseNote] = useState<string>("");

    // State variables for UI management
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // To show loading state
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [allExpenses, setAllExpenses] = useState<DocumentData[]>([]);

    const categories = [
        "Food",
        "Transport",
        "Bills",
        "Education",
        "Investment",
        "Luxuries",
        "Other",
    ];

    // Function to handle category change
    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(event.target.value);
    };

    // Function to handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.log("User is not authenticated. Exiting form submission.");
            return;
        }

        // New expense object with createdAt field
        const newExpense = {
            expenseTitle,
            uid,
            expenseAmount,
            expenseDate, // Store date as simple string in "YYYY-MM-DD" format
            expenseNote,
            expenseCategory,
            created_at: new Date(),
        };

        try {
            const collectionRef = collection(db, "expenses");
            await addDoc(collectionRef, newExpense); // Add new expense document to Firestore
            setShowModal(false); // Close the modal after successful submission
        } catch (e) {
            console.log("Error adding new expense:", e);
        }
        setExpenseTitle("");
        setExpenseAmount(undefined);
        setExpenseCategory("");
        setExpenseNote("");
    };

    // Function to sign out the user
    const signout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully.");
        } catch (e) {
            console.log("Error signing out:", e);
        }
    };

    // Function to fetch expenses data from Firestore in real-time
    let readExpenseRealtime: Unsubscribe;

    const fetchExpenseRealtime = () => {
        const collectionRef = collection(db, "expenses");
        const currentUserUID = auth.currentUser?.uid;
        if (!currentUserUID) return;

        const q = query(collectionRef, where("uid", "==", currentUserUID));

        // Reset the state before setting new values
        setAllExpenses([]);

        readExpenseRealtime = onSnapshot(q, (querySnapshot) => {
            let updatedExpenses: DocumentData[] = [];
            querySnapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                const expense = { ...data, id: change.doc.id };

                if (change.type === "added") {
                    console.log("Expense added: ", expense);
                    updatedExpenses.push(expense); // Only add the new expense
                } else if (change.type === "modified") {
                    console.log("Expense modified: ", expense);
                    updatedExpenses = updatedExpenses.map((item) =>
                        item.id === expense.id ? expense : item
                    ); // Replace the modified expense
                } else if (change.type === "removed") {
                    console.log("Expense removed: ", expense);
                    updatedExpenses = updatedExpenses.filter(
                        (item) => item.id !== expense.id
                    ); // Remove the deleted expense
                }
            });
            setAllExpenses((prevExpenses) => {
                // Avoid duplicating entries by checking the IDs
                const mergedExpenses = [...prevExpenses];
                updatedExpenses.forEach((expense) => {
                    const existingIndex = mergedExpenses.findIndex(
                        (item) => item.id === expense.id
                    );
                    if (existingIndex === -1) {
                        mergedExpenses.push(expense);
                    } else {
                        mergedExpenses[existingIndex] = expense;
                    }
                });
                mergedExpenses.sort((a, b) => b.created_at - a.created_at);
                return mergedExpenses;
            });
            setLoading(false);
        });
    };

    // useEffect to fetch expenses when the component mounts
    useEffect(() => {
        const detachOnAuthListiner = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchExpenseRealtime();
            }
        });

        return () => {
            if (readExpenseRealtime) {
                console.log("Component Unmount.");
                readExpenseRealtime(); // Unsubscribe on unmount
                detachOnAuthListiner();
            }
        };
    }, []);

    const handleAddExpenseClick = () => {
        setShowModal(true);
    };

    const handleDeleteExpense = async (expenseId: string) => {
        try {
            const expenseRef = doc(db, "expenses", expenseId);
            await deleteDoc(expenseRef);

            setAllExpenses((expenses) =>
                expenses.filter((expense) => expense.id !== expenseId)
            );

            console.log("Expense deleted successfully.");
            toast.success("Expense Delete Successfully", {
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
        } catch (error) {
            console.log("Error deleting expense:", error);
        }
    };


    return (
        <div>
            {/* Header */}
            <Header signout={signout} onAddExpenseClick={handleAddExpenseClick} />

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Title:</label>
                                <input
                                    type="text"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={expenseTitle}
                                    onChange={(e) => setExpenseTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Amount:</label>
                                <input
                                    type="number"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={expenseAmount || ""}
                                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Category:</label>
                                <select
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={expenseCategory}
                                    onChange={(e) => setExpenseCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Date:</label>
                                <input
                                    type="date"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)} // Use value as string
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Note:</label>
                                <textarea
                                    className="border border-gray-300 p-2 rounded w-full"
                                    value={expenseNote}
                                    onChange={(e) => setExpenseNote(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="mr-4 px-4 py-2 bg-gray-300 rounded"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-8 px-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Your Expenses</h2>
                    <div>
                        <label className="mr-2 font-semibold">Filter by Category:</label>
                        <select
                            className="border border-gray-300 p-2 rounded cursor-pointer"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option className="!cursor-pointer" key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? (
                    <p>Loading...</p> // Show loading text while data is being fetched
                ) : allExpenses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    {["Title", "Amount", "Category", "Date", "Note"].map(
                                        (head) => (
                                            <th
                                                key={head}
                                                className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
                                            >
                                                {head}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {allExpenses
                                    .filter((expense) =>
                                        selectedCategory
                                            ? expense.expenseCategory === selectedCategory
                                            : true
                                    )
                                    .map((expense, index) => (
                                        <tr
                                            key={expense.id}
                                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        >
                                            {[
                                                expense.expenseTitle,
                                                parseFloat(expense.expenseAmount).toFixed(2),
                                                expense.expenseCategory,
                                                expense.expenseDate,
                                                expense.expenseNote || "N/A",
                                            ].map((val, i) => (
                                                <td
                                                    key={i}
                                                    className="py-2 px-4 border-b border-gray-200"
                                                >
                                                    {val}
                                                </td>
                                            ))}
                                            <td onClick={() => handleDeleteExpense(expense?.id)}>
                                                <Edit />
                                                <Delete className="cursor-pointer"/>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No expenses found. Start adding your expenses!</p>
                )}
            </div>
        </div>
    );
}
