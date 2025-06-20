import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit3, Save, XCircle, Volume2 , Link as LinkIcon} from 'lucide-react'; // Icons
import { useAuth } from "react-oidc-context";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
// Define the CSS directly as a string
const appStyles = `
/* Global styles for HTML and Body to ensure full viewport coverage */
html, body {
    margin: 0;
    padding: 0;
    width: 100%; /* Ensure it takes full viewport width */
    height: 100%; /* Ensure it takes full viewport height */
    overflow-x: hidden; /* Prevent horizontal scrolling */
    display: block; /* Ensure it behaves as a block element filling space */
    font-family: 'Inter', sans-serif; /* Set font globally */
}

/* Base container and card styles (mobile-first) */
.container {
    min-height: 100vh;
    background: linear-gradient(to bottom right, #6366f1, #9333ea);
    display: flex;
    flex-direction: column;
    align-items: center; /* Centers children horizontally in a column flex container */
    justify-content: center;
    padding: 1rem;
    color: #374151;
    width: 100%; /* Explicitly ensure container takes full width of its parent */
    box-sizing: border-box; /* Include padding in width calculation */
}

.card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%; /* Take full width up to max-width */
    max-width: 28rem; /* Default max-width for smaller screens (e.g., mobile), adjust as needed */
    margin: 0 auto; /* Explicitly center the card horizontally */
    box-sizing: border-box; /* Include padding in width calculation */
}

.heading {
    font-size: 1.875rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
    color: #374151;
}

.subHeading {
    font-size: 1.25rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
}

/* Messages */
.message {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #ffffff;
}

.errorMessage {
    background-color: #ef4444;
}

.successMessage {
    background-color: #22c55e;
}

.errorMessageAlt {
    color: #dc2626;
    text-align: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #fee2e2;
    border-radius: 0.5rem;
    border: 1px solid #fca5a5;
}

/* Input Fields */
.inputField {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    outline: none;
    transition-property: all;
    transition-duration: 200ms;
}
.inputField:focus {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

/* Buttons */
.addButton {
    background-color: #4f46e5;
    color: #ffffff;
    padding: 0.75rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition-property: all;
    transition-duration: 200ms;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    outline: none;
}
.addButton:hover {
    background-color: #4338ca;
}
.addButton:focus {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.5);
}
.addButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}



/* Add Section */
.addSection {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
}

/* Search Section */
.searchSection {
    margin-bottom: 1.5rem;
}

/* Loading Spinner */
.loadingMessage {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4338ca;
    margin-bottom: 1rem;
}
.spinner {
    animation: spin 1s linear infinite;
    height: 1.25rem;
    width: 1.25rem;
    margin-right: 0.75rem;
}
.spinnerPath {
    opacity: 0.25;
}
.spinnerFill {
    opacity: 0.75;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Empty List Message */
.emptyList {
    text-align: center;
    color: #6b7280;
}

/* Product List */
.productList {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.productItem {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition-property: all;
    transition-duration: 200ms;
}
.productItem:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.productDetails {
    flex: 1;
    width: 100%;
}

.productName {
    color: #1f2937;
    font-weight: 600;
    font-size: 1.125rem;
}

.productInfo {
    color: #4b5563;
    font-size: 0.875rem;
}

.itemActions {
    display: flex;
    gap: 0.25rem;
    margin-left: auto;
    margin-top: 0.75rem;
}

.editButton,
.deleteButton,
.saveButton,
.cancelButton {
    padding: 0.5rem;
    border-radius: 9999px;
    transition-property: all;
    transition-duration: 200ms;
}
.editButton:hover,
.deleteButton:hover,
.saveButton:hover,
.cancelButton:hover {
    background-color: #e5e7eb;
}
.editButton { color: #2563eb; }
.editButton:hover { color: #1d4ed8; }
.deleteButton { color: #dc2626; }
.deleteButton:hover { color: #b91c1c; }
.saveButton { color: #16a34a; }
.saveButton:hover { color: #15803d; }
.cancelButton { color: #dc2626; }
.cancelButton:hover { color: #b91c1c; }
.editButton:disabled,
.deleteButton:disabled,
.saveButton:disabled,
.cancelButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


/* Editing Form within List Item */
.editForm {
    flex: 1;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding-right: 1rem;
    margin-bottom: 0.75rem;
}

.editInputField {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    outline: none;
}
.editInputField:focus {
    box-shadow: 0 0 0 1px rgba(147, 51, 234, 0.5);
}

.editActions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}
.speakerButton {
    background: none;
    border: none;
    cursor: pointer;
    color: #6366f1; /* Tailwind indigo-500 */
    padding: 0.25rem;
    border-radius: 9999px; /* Full rounded */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 200ms;
    margin-left: 0.5rem; /* Space from product name */
    vertical-align: middle; /* Align with text */
}

.speakerButton:hover {
    background-color: #eef2ff; /* Tailwind indigo-50 */
}

.speakerButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #9ca3af; /* Tailwind gray-400 */
}

/* --- Responsive Breakpoints --- */

@media (min-width: 768px) {
    .card {
        max-width: 48rem; /* Increased max-width for md screens */
    }
    .productItem {
        flex-direction: row;
        align-items: center;
    }
    .itemActions {
        margin-top: 0;
    }
    .editForm {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-bottom: 0;
    }
    .editActions {
        grid-column: span 2 / span 2;
    }
}

@media (min-width: 1024px) { /* Optional: for larger desktop screens */
    .card {
        max-width: 60rem; /* Even wider on large desktops */
    }
}
`;


// Main App Component
const App = () => {
  const auth = useAuth();

  console.log(auth)
   if (auth.isLoading) {
    
    // return <div>Loading...</div>;
    return  <div className="container">
            <div className="card"><div className="loadingMessage">
                        <svg className="spinner" viewBox="0 0 24 24">
                            <circle className="spinnerPath" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="spinnerFill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </div>
                    </div>
              </div>
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

    // Inject styles into the document head on component mount
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.type = 'text/css';
        styleTag.appendChild(document.createTextNode(appStyles));
        document.head.appendChild(styleTag);

        // Cleanup on unmount (optional for single-page apps unless component is repeatedly mounted/unmounted)
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []); // Empty dependency array ensures this runs only once on mount


    // State variables for items, new product input, editing product, loading, and error
    const [items, setItems] = useState([]);
    const [newProductName, setNewProductName] = useState('');
    const [newQuantity, setNewQuantity] = useState('');
    const [newPrice, setNewPrice] = useState('');

    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProductName, setEditingProductName] = useState('');
    const [editingQuantity, setEditingQuantity] = useState('');
    const [editingPrice, setEditingPrice] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); // For success/error messages

    // New state for search term
    const [searchTerm, setSearchTerm] = useState('');
    const [speakingProductId, setSpeakingProductId] = useState(null);
      // S3 related states
    const [s3BucketInput, setS3BucketInput] = useState('');
    const [s3ObjectKeyInput, setS3ObjectKeyInput] = useState('');
    const [generatedS3Url, setGeneratedS3Url] = useState('');
    const [s3OperationLoading, setS3OperationLoading] = useState(false);
    const [s3GeneratedAudioUrl, setS3GeneratedAudioUrl] = useState(''); // For playing audio from S3 URL
    const [s3Client, setS3Client] = useState(null); // S3Client state

     

    // Placeholder for your API Gateway base URL
    // IMPORTANT: Replace this with your actual AWS API Gateway URL
    const API_BASE_URL = 'https://8iduc6xqo8.execute-api.us-east-1.amazonaws.com/dev'; // e.g., 'https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/products'

    // Helper function to show messages
    const showMessage = (msg, type = 'success') => {
        setMessage({ text: msg, type });
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    };
    const { user, authError, isLoading: authIsLoading, isAuthenticated} = useAuth(); // Ge, t user from react-oidc-context
  useEffect(() => {
      const initializeS3ClientWithoutAmplify = async () => {
          if (user && user.id_token) {
              try {
                  // This function dynamically fetches and refreshes temporary AWS credentials
                  const credentialsProvider = fromCognitoIdentityPool({
                      identityPoolId: 'us-east-1:72841e45-3285-47d4-b207-de7dc5a768df', // Replace with your actual Identity Pool ID
                      clientConfig: { region: 'us-east-1' }, // Your AWS region
                      logins: {
                          // Map your User Pool authority to the ID token
                          'cognito-idp.us-east-1.amazonaws.com/us-east-1_njntFpaNa': user.id_token
                          // Format: 'cognito-idp.{region}.amazonaws.com/{userPoolId}': user.id_token
                      },
                  });

                  const newS3Client = new S3Client({
                      region: 'us-east-1', // Your AWS region
                      credentials: credentialsProvider // Pass the credentials provider function
                  });
                  setS3Client(newS3Client);
                  console.log("S3Client initialized without Amplify, using Identity Pool credentials.");
              } catch (e) {
                  console.error("Error initializing S3Client without Amplify:", e);
                  // Handle error, e.g., show message to user
              }
          } else {
              setS3Client(null);
          }
      };

      initializeS3ClientWithoutAmplify();
  }, [user]);
 /*  // Function to fetch items (now includes search term)
    const fetchItems = useCallback(async (currentSearchTerm) => { // Accept currentSearchTerm as argument
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/products`;
            const queryParams = [];

            

            // Use the argument for search term
            if (currentSearchTerm) {
                queryParams.push(`search=${encodeURIComponent(currentSearchTerm)}`);
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await fetch(url, {headers: {'Authorization': `Bearer ${user?.id_token}`}});

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setItems(data);
        } catch (err) {
            console.error("Error fetching items:", err);
            if (!authError && !err.message.includes('token_missing')) {
                showMessage(`Failed to fetch items: ${err.message}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, fetch, user, showMessage]); */

    
   // --- FETCH (Read) Operation ---
    useEffect(() => {
        const fetchItems = async (currentSearchTerm) => {
            setLoading(true);
            setError(null);
            try {
              let url = `${API_BASE_URL}/products`;
              const queryParams = [];
              // Use the argument for search term
              if (currentSearchTerm) {
                  queryParams.push(`search=${encodeURIComponent(currentSearchTerm)}`);
              }

              if (queryParams.length > 0) {
                  url += `?${queryParams.join('&')}`;
              }

              const response = await fetch(url, {headers: {'Authorization': `Bearer ${user?.id_token}`}});

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
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

    const doFetchItems = useCallback(async (currentSearchTerm) => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/products`;
            const queryParams = [];

            // Use the argument for search term
            if (currentSearchTerm) {
                queryParams.push(`search=${encodeURIComponent(currentSearchTerm)}`);
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`;
            }

            const response = await fetch(url, {headers: {'Authorization': `Bearer ${user?.id_token}`}});

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setItems(data);
        } catch (err) {
            console.error("Error fetching items:", err);
            showMessage(`Failed to fetch items: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, showMessage, setItems]);


    // Filter items based on searchTerm (client-side filtering for demonstration)
    const filteredItems = items.filter(item =>
        item.productname.toLowerCase().includes(searchTerm.toLowerCase())
    ); 
    // Direct search handler for the input field
    const handleSearchChange = (e) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm); // Update the state
        doFetchItems(newTerm)// Immediately trigger fetch with the new term
    };

    // --- CREATE Operation ---
    const handleAddItem = async () => {
        if (!newProductName.trim() || !newQuantity || !newPrice) {
            showMessage('All fields are required!', 'error');
            return;
        }
        if (isNaN(newQuantity) || newQuantity < 0) {
            showMessage('Quantity must be a non-negative number!', 'error');
            return;
        }
        if (isNaN(newPrice) || newPrice < 0) {
            showMessage('Price must be a non-negative number!', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id_token}`
                },
                body: JSON.stringify({
                    productname: newProductName,
                    quantity: parseInt(newQuantity, 10),
                    price: parseFloat(newPrice),
                    user: auth.user?.profile.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const addedItem = await response.json();
            setItems([...items, addedItem]);
            setNewProductName('');
            setNewQuantity('');
            setNewPrice('');
            showMessage('Item added successfully!');
        } catch (err) {
            setError(`Failed to add item: ${err.message}`);
            showMessage(`Failed to add item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE Operation ---
    const handleDeleteItem = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${user?.id_token}`}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            setItems(items.filter((item) => item.productid !== productId));
            showMessage('Item deleted successfully!');
        } catch (err) {
            setError(`Failed to delete item: ${err.message}`);
            showMessage(`Failed to delete item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchItem = async (productSearchTerm) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products?search=${productSearchTerm}`, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${user?.id_token}`}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            // setItems(items.filter((item) => item.productid !== productSearchTerm));
            // showMessage('Item deleted successfully!');
        } catch (err) {
            setError(`Failed to search item: ${err.message}`);
            showMessage(`Failed to search item: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE (Start Editing) Operation ---
    const handleEditClick = (item) => {
        setEditingProductId(item.productid);
        setEditingProductName(item.productname);
        setEditingQuantity(item.quantity);
        setEditingPrice(item.price);
    };

    // --- UPDATE (Save Edited Item) Operation ---
    const handleSaveEdit = async (productId) => {
        if (!editingProductName.trim() || !editingQuantity || !editingPrice) {
            showMessage('All fields are required!', 'error');
            return;
        }
        if (isNaN(editingQuantity) || editingQuantity < 0) {
            showMessage('Quantity must be a non-negative number!', 'error');
            return;
        }
        if (isNaN(editingPrice) || editingPrice < 0) {
            showMessage('Price must be a non-negative number!', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id_token}`
                },
                body: JSON.stringify({
                    productname: editingProductName,
                    quantity: parseInt(editingQuantity, 10),
                    price: parseFloat(editingPrice)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            setItems(
                items.map((item) =>
                    item.productid === productId ?
                    {
                        ...item,
                        productname: editingProductName,
                        quantity: parseInt(editingQuantity, 10),
                        price: parseFloat(editingPrice)
                    } :
                    item
                )
            );
            setEditingProductId(null);
            setEditingProductName('');
            setEditingQuantity('');
            setEditingPrice('');
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
        setEditingProductId(null);
        setEditingProductName('');
        setEditingQuantity('');
        setEditingPrice('');
    };

    const handleGenerateS3GetSignedUrl = async (key) => {

      try {
          const getCommand = new GetObjectCommand({
              Bucket: 'ecom-polly-audio',
              Key: `${key}.mp3`,
          });
          // Generate a pre-signed URL for GET operation
          const url = await getSignedUrl(s3Client, getCommand, {
              expiresIn: 3600, // URL expires in 1 hour (adjust as needed)
          });

          
          showMessage(`GET Signed URL generated successfully!`, 'success');
          console.log("Generated S3 GET Signed URL:", url);
           const audio = new Audio(url);
            audio.onended = () => {
                setSpeakingProductId(null);
            };
            audio.onerror = (e) => {
                console.error("Error playing audio from S3 URL:", e);
                showMessage(`Failed to play audio from S3: ${e.message || 'Unknown error'}. Check S3 key and permissions.`, 'error');
                setSpeakingProductId(null);
            };
            audio.play();
            console.log(`Playing audio from S3: ${url}`);
      } catch (error) {
          console.error("Error generating S3 GET signed URL:", error);
          showMessage(`Failed to generate S3 GET signed URL: ${error.message}. Ensure S3 bucket exists and correct IAM permissions for Cognito Identity Pool.`);
      } finally {
          setS3OperationLoading(false);
      }
  };
  
  if (auth.isAuthenticated) {

  const signOutRedirect = () => {
    const clientId = "2p067oa8sj2k0u9llme1f05kj3";
    const logoutUri = "https://d1s0dilg6yxd4e.cloudfront.net/";
    const cognitoDomain = "https://us-east-1njntfpana.auth.us-east-1.amazoncognito.com";
    auth.removeUser();
    window.location.replace(`${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`);
  };
    return (
        <div className="container">
            <div className="card">
          
                <h1 className="heading">ANN Traders Product Management</h1>

                {/* Message display */}
                {message.text && (
                    <div className={`message ${message.type === 'error' ? 'errorMessage' : 'successMessage'}`}>
                        {message.text}
                    </div>
                )}

                {/* Add New Item */}
                <div className="addSection">
                    <h2 className="subHeading">Add New Product</h2>
                    <input
                        type="text"
                        className="inputField"
                        placeholder="Product Name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                    />
                    <input
                        type="number"
                        className="inputField"
                        placeholder="Quantity"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        min="0"
                    />
                    <input
                        type="number"
                        className="inputField"
                        placeholder="Price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        step="0.01"
                        min="0"
                    />
                    <button
                        onClick={handleAddItem}
                        className="addButton"
                        disabled={loading}
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>

                {/* Search Bar */}
                <div  className="addSection">
                    <input
                        type="text"
                        className="inputField"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        // onChange={(e) => setSearchTerm(e.target.value)}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Loading and Error Indicators */}
                {loading && (
                    <div className="loadingMessage">
                        <svg className="spinner" viewBox="0 0 24 24">
                            <circle className="spinnerPath" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="spinnerFill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </div>
                )}
                {error && (
                    <div className="errorMessageAlt">
                        {error}
                    </div>
                )}

                {/* Item List */}
                <h2 className="subHeading">Product List</h2>
                {filteredItems.length === 0 && !loading && !error && searchTerm ? (
                    <p className="emptyList">No products found matching "{searchTerm}".</p>
                ) : filteredItems.length === 0 && !loading && !error ? (
                    <p className="emptyList">No products found. Add one!</p>
                ) : (
                    <ul className="productList">
                        {filteredItems.map((item) => (
                            <li
                                key={item.productid}
                                className="productItem"
                            >
                                {editingProductId === item.productid ? (
                                    // Editing mode
                                    <div className="editForm">
                                        <input
                                            type="text"
                                            value={editingProductName}
                                            onChange={(e) => setEditingProductName(e.target.value)}
                                            className="editInputField"
                                            placeholder="Product Name"
                                        />
                                        <input
                                            type="number"
                                            value={editingQuantity}
                                            onChange={(e) => setEditingQuantity(e.target.value)}
                                            className="editInputField"
                                            placeholder="Quantity"
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            value={editingPrice}
                                            onChange={(e) => setEditingPrice(e.target.value)}
                                            className="editInputField"
                                            placeholder="Price"
                                            step="0.01"
                                            min="0"
                                        />
                                        <div className="editActions">
                                            <button
                                                onClick={() => handleSaveEdit(item.productid)}
                                                className="saveButton"
                                                disabled={loading}
                                            >
                                                <Save size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleCancelEdit()} // Corrected: Removed redundant argument
                                                className="cancelButton"
                                                disabled={loading}
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Display mode
                                    <div className="productDetails">
                                        <p className="productName">{item.productname}</p>
                                        <button
                                                onClick={() =>handleGenerateS3GetSignedUrl(item.productid)}
                                                className="speakerButton"
                                                title="Read product name"
                                            >
                                                <Volume2 size={20} />
                                               {/*  {speakingProductId === item.productid && (
                                                    <span className="ml-2 text-xs text-indigo-600">Speaking...</span>
                                                )} */}
                                            </button>
                                        <p className="productInfo">Quantity: {item.quantity}</p>
                                        <p className="productInfo">Price: ${item.price ? item.price.toFixed(2) : 'N/A'}</p>
                                    </div>
                                )}

                                {/* Action buttons (only visible if not editing) */}
                                {editingProductId !== item.productid && (
                                    <div className="itemActions">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="editButton"
                                            disabled={loading}
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.productid)}
                                            className="deleteButton"
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
                                
              <div className="addSection"> <button className='addButton' onClick={() => signOutRedirect()}  disabled={loading}>Sign out</button> </div>
            </div>
        </div>
    );
  }
  return (
    
    <div className="card">
      <h1 className="heading">Welcome to ANN Traders!</h1>
      <button className="addButton" onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
};

export default App;
