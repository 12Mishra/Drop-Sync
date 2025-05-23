"use server";

import prisma from "@/actions/db/db";
import bcrypt from "bcryptjs";

export async function createNewUser(email, password) {
    console.log(email, password);
    
    try {
        const existinguser = await prisma.user.findUnique({
            where: {
                email: email
            },
        });

        if (existinguser) {
            return {
                success: false,
                message: "User already exists"
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        }); 
        console.log(newUser);
        

        return {
            success: true,
            message: "User created successfully"
        }

    } catch (error) {
        return {
            success: false,
            message: "Error occured"
        }
    }

}
