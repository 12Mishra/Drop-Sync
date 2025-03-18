"use server"

import prisma from "../db/db";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.NEXT_AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.NEXT_AWS_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
    },
});

export default async function deleteFile(id) {
    try {
        const fileToDelete = await prisma.files.findUnique({
            where: { id },
        });
        console.log(fileToDelete);
        

        if (!fileToDelete) {
            return { failure: "File not found" };
        }

        const fileKey = fileToDelete.fileURL?.split("/").pop();
        if (!fileKey) {
            return { failure: "Invalid file URL" };
        }

        console.log(fileKey);
        
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.NEXT_AWS_BUCKET_NAME,
                Key: fileKey,
            })
        );

        await prisma.files.delete({ where: { id } });

        return { success: "File deleted successfully" };

    } catch (error) {
        console.error("Error deleting file:", error);
        return { failure: "Could not delete file", error: error.message };
    }
}
