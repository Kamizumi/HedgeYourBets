import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@/auth";

// 1. Init Client
const client = new DynamoDBClient({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function PATCH(req: Request) {
  // 2. Get the User Session
  const session = await auth();
  console.log("User session from update-bet api:", session);
  
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Get Data from Request
  const body = await req.json();
  const { betId, status, result } = body;

  if (!betId || !status) {
    return Response.json({ error: "betId and status are required" }, { status: 400 });
  }

  // 4. Update the bet in DynamoDB
  try {
    const updateExpression = result 
      ? "SET #status = :status, #result = :result"
      : "SET #status = :status";
    
    const expressionAttributeValues = result
      ? { ":status": status.toUpperCase(), ":result": result, ":userId": session.user.id }
      : { ":status": status.toUpperCase(), ":userId": session.user.id };

    await docClient.send(new UpdateCommand({
      TableName: "PreviousBets",
      Key: {
        UserId: session.user.id,
        createdAt: betId, // betId is the createdAt timestamp
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: {
        "#status": "status",
        ...(result && { "#result": "result" })
      },
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "UserId = :userId", // Ensure user owns this bet
    }));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating bet:", error);
    return Response.json({ error: "Failed to update bet" }, { status: 500 });
  }
}
