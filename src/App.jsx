import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Save, XCircle } from 'lucide-react'; // Icons

// Main App Component
const App = () => {
    // State variables for items, new item input, editing item, loading, and error
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemName, setEditingItemName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages

    // Placeholder for your API Gateway base URL
    // IMPORTANT: Replace this with your actual AWS API Gateway URL
    const API_BASE_URL = 'YOUR_API_GATEWAY_BASE_URL'; // e.g., 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/items'

    // Helper function to show messages
    const showMessage = (msg, type = 'success') => {
        setMessage({ text: msg, type });
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    };

    // --- FETCH (Read) Operation ---
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            try {
                // Adjust the URL based on your API Gateway setup for GET /items
                const response = await fetch(`${API_BASE_URL}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Assuming data is an array of objects like { id: '...', name: '...' }
                setItems(data);
            } catch (err) {
                setError(`Failed to fetch items: ${err.message}`);
                showMessage(`Failed to fetch items: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [API_BASE_URL]);

    // --- CREATE Operation ---
    const handleAddItem = async () => {
        if (!newItemName.trim()) {
            showMessage('Item name cannot be empty!', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Adjust the URL based on your API Gateway setup for POST /items
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newItemName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const addedItem = await response.json();
            setItems([...items, addedItem]); // Add the new item returned by the backend
            setNewItemName('');
            showMessage('Item added successfully!');
        } catch (err) {
            setError(`Failed to add item: ${err.message}`);
            showMessage(`Failed to add item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE Operation ---
    const handleDeleteItem = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Adjust the URL based on your API Gateway setup for DELETE /items/{id}
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            setItems(items.filter((item) => item.id !== id)); // Remove item from local state
            showMessage('Item deleted successfully!');
        } catch (err) {
            setError(`Failed to delete item: ${err.message}`);
            showMessage(`Failed to delete item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE (Start Editing) Operation ---
    const handleEditClick = (item) => {
        setEditingItemId(item.id);
        setEditingItemName(item.name);
    };

    // --- UPDATE (Save Edited Item) Operation ---
    const handleSaveEdit = async (id) => {
        if (!editingItemName.trim()) {
            showMessage('Item name cannot be empty!', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Adjust the URL based on your API Gateway setup for PUT /items/{id}
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: editingItemName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            // Update item in local state
            setItems(
                items.map((item) =>
                    item.id === id ? { ...item, name: editingItemName } : item
                )
            );
            setEditingItemId(null); // Exit editing mode
            setEditingItemName('');
            showMessage('Item updated successfully!');
        } catch (err) {
            setError(`Failed to update item: ${err.message}`);
            showMessage(`Failed to update item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel editing
    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemName('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">CRUD App with AWS</h1>

                {/* Message display */}
                {message.text && (
                    <div className={`p-3 mb-4 rounded-lg text-sm text-white ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {message.text}
                    </div>
                )}

                {/* Add New Item */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200"
                        placeholder="Add new item"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <button
                        onClick={handleAddItem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                        disabled={loading}
                    >
                        <Plus size={20} />
                        Add
                    </button>
                </div>

                {/* Loading and Error Indicators */}
                {loading && (
                    <div className="flex items-center justify-center text-indigo-700 mb-4">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </div>
                )}
                {error && (
                    <div className="text-red-600 text-center mb-4 p-3 bg-red-100 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* Item List */}
                {items.length === 0 && !loading && !error ? (
                    <p className="text-center text-gray-500">No items found. Add one!</p>
                ) : (
                    <ul className="space-y-3">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                            >
                                {editingItemId === item.id ? (
                                    // Editing mode
                                    <div className="flex-1 flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={editingItemName}
                                            onChange={(e) => setEditingItemName(e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-400 outline-none"
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(item.id)}
                                            className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                                            disabled={loading}
                                        >
                                            <Save size={20} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                                            disabled={loading}
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    // Display mode
                                    <span className="flex-1 text-gray-700 text-lg">{item.name}</span>
                                )}

                                {/* Action buttons (only visible if not editing) */}
                                {editingItemId !== item.id && (
                                    <div className="flex gap-1 ml-auto">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                                            disabled={loading}
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
                                            disabled={loading}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default App;
