import express from "express"
const router = express.Router();
import { sql } from '../config/db.js';


router.post('/', async(req,res)=>{
    const {user_id,title,amount,category} = req.body;
    try {
        if(!user_id || !title || amount===undefined || !category) {
            return res.status(400).json({error: "All fields are required"});
        }
        const result = await sql`INSERT INTO TRANSACTIONS(user_id,title,amount,category)VALUES (${user_id},${title},${amount},${category}) RETURNING *`;

        res.status(201).json(result[0]);
        
    } catch (error) {
        
        console.error("Error creating transaction:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.get('/:user_id',async (req,res)=>{
    const {user_id} = req.params;
    try {
        const result = await sql`SELECT * FROM TRANSACTIONS WHERE user_id = ${user_id} ORDER BY created_at DESC `;
        if(result.length===0){
            return res.status(404).json({error: "Transaction not found"});
        }
        res.status(200).json(result);
        
    } catch (error) {
         console.error("Error fetching transaction:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.delete('/:id',async(req,res)=>{
    try {
        const {id} =  req.params;
        if(isNaN(parseInt(id))) {
            return res.status(400).json({error: "Invalid transaction ID"});
        }
        const result = await sql`DELETE FROM TRANSACTIONS WHERE id = ${id} RETURNING *`;
        if(result.length===0){
            return res.status(404).json({error: "Transaction not found"});
        }
        res.status(200).json({message: "Transaction deleted successfully", transaction: result[0]});

        
    } catch (error) {
         console.error("Error Deleting transaction:", error);
        res.status(500).json({error: "Internal Server Error"});
        
    }
})

router.get('/summary/:user_id', async (req,res)=>{
    const {user_id} = req.params;
    try {
        const balanceRes = await sql`
            SELECT COALESCE(SUM(amount),0) AS balance FROM TRANSACTIONS WHERE user_id = ${user_id}
            `;
            const incomeRes = await sql`
            SELECT COALESCE(SUM(amount),0) AS income FROM TRANSACTIONS WHERE user_id = ${user_id} AND amount > 0
            `;

            const expenseRes = await sql`
            SELECT COALESCE(SUM(amount),0) AS expense FROM TRANSACTIONS WHERE user_id = ${user_id} AND amount < 0
            `;

            res.status(200).json({
                balance: balanceRes[0].balance,
                income: incomeRes[0].income,
                expense: expenseRes[0].expense
            });

    } catch (error) {
        console.error("Error fetching transaction summary:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

export default router;