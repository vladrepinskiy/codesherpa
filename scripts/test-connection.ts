// Simple script to test network connectivity
console.log("Testing connection to Supabase...");

async function testConnection() {
  try {
    console.log("Fetching from Supabase URL...");
    const response = await fetch("https://cequrbhyjgljrocnhcbv.supabase.co");
    console.log("Response status:", response.status);
    console.log("Connection successful!");
    return true;
  } catch (error) {
    console.error("Connection failed:", error);
    return false;
  }
}

testConnection().then((success) => {
  console.log("Test completed, success:", success);
  process.exit(success ? 0 : 1);
});
