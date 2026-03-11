import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@/auth"; // Your NextAuth configuration

// 1. Init Client
const client = new DynamoDBClient({
  region: process.env.AUTH_DYNAMODB_REGION,
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(req: Request) {
  // 2. Get the User Session
  
  const session = await auth();
  console.log("User session from api:", session);
  if (!session || !session.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Get Data from Frontend Form
  const body = await req.json();

  // 4. Construct the Item
  const newItem = {
    UserId: session.user.id,            // The PK
    createdAt: new Date().toISOString(), // The SK (Current Time)
    
    sport: body.sport,
    team: body.team,
    player: body.player,
    betType: body.betType, // "Over" or "Under"
    metric: body.metric,   // "Passing Yards"
    line: Number(body.line),
    wager: Number(body.wager),
    
    status: "PENDING", // Default status
    aiPrediction: body.aiPrediction || "No prediction available"
  };

  // 5. Send to DynamoDB
  try {
    await docClient.send(new PutCommand({
      TableName: "PreviousBets",
      Item: newItem,
    }));
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to place bet" }, { status: 500 });
  }
}