import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const OrdersToConfirm = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Make the request with the token in the Authorization header
                const response = await axios.get(
                    `http://localhost:8000/api/confirmed-orders?restaurantId=${restaurantId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setOrders(response.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders");
                setLoading(false);
            }
        };

        fetchOrders();
    }, [restaurantId]);

    const handleViewDetails = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) return <div className="container mx-auto mt-4 p-4">Loading orders...</div>;
    if (error) return <div className="container mx-auto mt-4 p-4 text-red-500">{error}</div>;
    
    return (
        <div className="ml-0 mt-4 p-4 max-w-5xl">
            <h1 className="text-2xl font-bold mb-6">Orders to Confirm</h1>
            <button
                onClick={() => navigate('/rList')}
            >
                Back to Restaurant List
            </button>
            {orders.length === 0 ? (
                <p className="text-gray-500">No orders to confirm at this time.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="mb-4">
                                <h3 className="font-semibold text-xl">Order #{order._id.slice(-6)}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-base my-1">
                                    <span className="font-medium">Items:</span> {order.items.length}
                                </p>
                                <p className="text-base my-1">
                                    <span className="font-medium">Total:</span> ${order.totalAmount?.toFixed(2)}
                                </p>
                                <p className="text-base my-1">
                                    <span className="font-medium">Status:</span> {order.status}
                                </p>
                            </div>
                            
                            <button
                                onClick={() => handleViewDetails(order._id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition duration-300"
                            >
                                More Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersToConfirm;