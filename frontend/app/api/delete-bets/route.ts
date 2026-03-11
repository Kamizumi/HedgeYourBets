import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@/auth";

// Validate required environment variables
if (!process.env.AUTH_DYNAMODB_REGION || !process.env.AUTH_DYNAMODB_ID || !process.env.AUTH_DYNAMODB_SECRET) {
    throw new Error("Missing required DynamoDB environment variables");
}

//initiate client
const client = new DynamoDBClient({
    region: process.env.AUTH_DYNAMODB_REGION,  
    credentials: {
        accessKeyId: process.env.AUTH_DYNAMODB_ID,
        secretAccessKey: process.env.AUTH_DYNAMODB_SECRET,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function DELETE(req: Request) {
    //get user session
    const session = await auth();

    if (!session || !session.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    //get the createdAt timestamp from request body
    try {
        const body = await req.json();
        
        if (!body.createdAt) {
            return Response.json({ error: "createdAt is required" }, { status: 400 });
        }

        //delete bet from DynamoDB
        const command = new DeleteCommand({
            TableName: "PreviousBets",
            Key: {
                UserId: session.user.id,  //partition Key
                createdAt: body.createdAt,  //sort Key 
            },
            ReturnValues: "ALL_OLD",  // Return the deleted item to verify it existed
        });

        const result = await docClient.send(command);
        
        // Check if item was actually deleted
        if (!result.Attributes) {
            return Response.json({ 
                error: "Bet not found" 
            }, { status: 404 });
        }
        
        //return success response
        return Response.json({ 
            success: true,
            message: "Bet deleted successfully"
        });
        
    } catch (error) {
        console.error("Error deleting bet:", error);
        return Response.json({ error: "Failed to delete bet" }, { status: 500 });
    }
}