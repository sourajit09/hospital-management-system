# Backend

## Packages Used

1. cors : We can allows the frontend ip to access backend
2. dotenv : Using this we can use enviorment variables
3. express : Using this we can we can create apis
4. jsonwebtoken : Using this we can enables the user authentication so that user can login
5. mongoose : this will manage our database connectivity
6. multer : This will allows us to store our images on our coludinary storage
7. nodemon : this will restart our app when use make any changes in backend
8. validator : we validate the user data coming from frontend
9. cloudinary : this is a popular cloud-based image and video management service
10. bcrypt : using this we will encrypt our user password and stored in database

## Razorpay setup

1. Create Razorpay Test keys from dashboard and add them to `.env`
   ```
   RAZORPAY_KEY_ID=<your_key_id>
   RAZORPAY_KEY_SECRET=<your_key_secret>
   CURRENCY=INR
   ```
2. The `/api/user/payment-razorpay` endpoint now creates an order and stores the Razorpay order id on the appointment.
3. `/api/user/verifyRazorpay` validates the signature, marks `payment=true`, and saves payment/order ids.
4. Frontend fetches the public key via `/api/user/razorpay-key` after login; keep keys only in backend.
