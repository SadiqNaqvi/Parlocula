import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

type usersChoice = {
  mood: any;
  genre: string[];
  year: string;
  adult: boolean;
  actor?: string;
};

const generatePrompt = (choice: usersChoice) => {
  const prompt = `
  ${choice.mood.label !== "neutral" ? `I am feeling ${choice.mood.label}.` : ""}
  Suggest some Movies and Shows that satisfy all the following criteria. Include all the similar movies and tv shows in another object called "similar" in the response.
  genre: ${choice.genre},
  ${choice.year !== "Doesn't matter." ? `Release Date: [${choice.year}],` : ""}
  ${choice.actor ? `Actor: [${choice.actor}]` : ""}
  
  Return the responses combined in proper JSON format with status 200. The Return response should look like,
  response: {
      status: 200,
          movie: Array of movies,
          show: Array of shows,
          similar: Array of similar movies and shows,
      }

      All the array of responses must include all the following details,
      {
          title: String,
          synopsis: String,
          rating: String,
          maturity_rating: String,
          runtime: String,
          release_year: Number,
          genre: Array,
          cast: Array,
          directors: Array,
          writers: Array,
          provider: String,
          available_on: URL,
      }
          
      If no movies or tv shows are found, return a response with 404 status in JSON format. Every Response should be in json format, with status.
      `;

  return prompt;
};

const generateAiResponce = async (choice: usersChoice) => {
  if (!choice) return;
  const prompt = generatePrompt(choice);
  try {
    const { response } = await model.generateContent(prompt);
    if (
      !response.candidates ||
      !response.candidates[0].content.parts ||
      !response.candidates[0].content.parts[0].text
    )
      return;
      
    const res = response.candidates[0].content.parts[0].text;

    if (!res.includes("json")) return;
    const cleanRes = JSON.parse(
      res.replaceAll("```", "").replaceAll("json", "")
    );
    if (cleanRes.status < 300) return cleanRes;
  } catch (err) {
    console.log("Failed Generating Response: ", err);
    return;
  }
};

export default generateAiResponce;
