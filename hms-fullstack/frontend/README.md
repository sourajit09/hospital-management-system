# Frontend

## Packages Used

1. axios: To send api requests to backend server
2. react-router-dom : To specify and define react routes
3. react-toasify : To show some notifications to user

## Razorpay configuration

Create `frontend/.env` with:
```
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=<your_public_key>   # optional if you fetch from backend
VITE_CURRENCY_SYMBOL=₹
```
The app also fetches the public key from `/api/user/razorpay-key` after login, so you can keep the key only in backend `.env` if you prefer.
