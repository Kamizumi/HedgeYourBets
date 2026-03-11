import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

export async function GET(req: Request) {
  // 2. Get the User Session
  const session = await auth();
  console.log("User session from get-bets api:", session);
  
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Query DynamoDB for all bets for this user
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: "PreviousBets",
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": session.user.id,
      },
      ScanIndexForward: false, // Sort by createdAt descending (newest first)
    }));

    // 4. Return the bets
    return Response.json({ 
      success: true, 
      bets: result.Items || [] 
    });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return Response.json({ error: "Failed to fetch bets" }, { status: 500 });
  }
}
