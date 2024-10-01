import { useAuthContext } from '@/app/context/authContext';
import React from 'react'

interface HeaderProps {
    signout: () => void;
    onAddExpenseClick: () => void;
}

export default function Header({ signout, onAddExpenseClick }: HeaderProps) {
    const { userName } = useAuthContext()!;
    return (
        <div className="flex justify-between px-10 py-4 bg-green-100 items-center">
            <h1 className="text-xl font-bold">Hello {userName}</h1>
            <div>
                {/* Add New Expense Button */}
                <button
                    onClick={onAddExpenseClick}
                    className="bg-blue-500 text-white px-4 py-2 mr-4 rounded"
                >
                    Add New Expense
                </button>
                {/* Logout Button */}
                <button onClick={signout} className="bg-red-500 text-white px-4 py-2 rounded">
                    Log out
                </button>
            </div>
        </div>
    );
};