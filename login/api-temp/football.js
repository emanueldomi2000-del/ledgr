const API_KEY = "6034563ef487e0b02ac91e9a5a633906";

async function getFixtures() {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=39&season=2025&next=10",
      {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const data = await response.json();

    console.log("LIVE FIXTURES:", data);

  } catch (error) {
    console.error("Football API Error:", error);
  }
}

getFixtures();