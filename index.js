const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const FetchUser = require('./Middleware')


const DBstring = process.env.MONGO_URL;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://bancroftautolocksmiths.onrender.com/',
    'https://bancroftautolocksmiths.onrender.com',
    'https://ecommerce-application-fiverr-client-6pwq.vercel.app'
  ],
  optionsSuccessStatus: 200
}));

mongoose.set('strictQuery',true)
const ConnectToMongo = async () => {
  try {
    await mongoose.connect(DBstring);
    console.log("Connected to database successfully!");
  } catch (error) {
    console.error("Error connecting to database: ", error);
  }
};
ConnectToMongo();


app.use('/customer', require('./Routes/UserAuth'))
app.use('/admin', require('./Routes/AdminAuth'))
app.use('/orders', require('./Routes/OrdersRoutes'))
app.use('/feedback' , require('./Routes/FeedbackRoutes'))

const Order = require('./Models/Order');
const Customer = require('./Models/Customer');
const stripe = require('stripe')(process.env.STRIPE_KEY)

   app.post('/Payment' , jsonParser , async (req,res)=>{
    try {
        const { token , amount } = req.body;
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: 'eur',
            customer: customer.id,
            receipt_email: token.email,
            description: "A test account"
        })
    }
    catch (error) {
        console.log(error);
        Status = "failed";
        Error = error;
    }
})

app.get("/config" , (req,res) =>{
    res.send({
        publishableKey : process.env.PUBLISHABLE_KEY
    })
})
app.post("/create-payment-intent", jsonParser, async (req, res) => {
    try {
      console.log(req.body);
      const amountInCents = Math.round(parseFloat(req.body.Price) * 100);
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true }
      });
  
      if (!paymentIntent) {
        return res.status(500).json({ error: "Payment Intent Error" });
      }
  
      res.status(200).json({ ClientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    }
  });
  
app.post("/createOrder" ,  FetchUser , jsonParser , async( req, res ) =>{
    try
    {
        const FindCustomer = await Customer.findOne( { _id : req.user.id })
        const NewOrder = new Order({
            UserEmail : FindCustomer.email,
            Email: req.body.Email,
            Address1: req.body.Address1,
            Address2: req.body.Address2,
            City : req.body.City,
            PostCode : req.body.PostCode,
            Country : req.body.Country,
            Phone: req.body.Phone,
            Type: req.body.Type,
            FrontOption : req.body.FrontOption,
            RearOption : req.body.RearOption,
            PlateChoice : req.body.PlateChoice,
            PlateText : req.body.PlateText,
            Layout : req.body.Layout,
            Font : req.body.Font,
            FrontSize : req.body.FrontSize,
            RearSize : req.body.RearSize,
            Badge: req.body.Badge,
            BadgeBackground : req.body.BadgeBackground,
            Border : req.body.Border,
            FooterText : req.body.FooterText,
            Vertical : req.body.Vertical,
            ShortHand : req.body.ShortHand,
            FooterColor: req.body.FooterColor,
            Delivery : req.body.Delivery,
            Spare : req.body.Spare,
            OrderValue : req.body.OrderValue,
            OrderStatus: "Not Processed",
        }).save()
        res.status(200).json({success: true})


    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
})




PORT = process.env.PORT || 5001
app.listen( PORT , ()=> {console.log("LISTENING AT PORT: 3001")} )
