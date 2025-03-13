const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../verses.txt'); // Path to the verses.txt file

module.exports = async (req, res) => {
  const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

  const verseData = await getVerseFromFile(today);  // Check if the verse for today already exists
  
  if (verseData) {
    return res.status(200).json(verseData);  // If verse exists, return it
  } else {
    const newVerse = await fetchNewVerse();   // If no verse for today, fetch a new one
    await saveVerseToFile(today, newVerse);   // Save the new verse to the file
    return res.status(200).json(newVerse);    // Return the new verse
  }
};

// Function to read the verse from the file
const getVerseFromFile = async (date) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const verses = data.split('\n');
    for (let verse of verses) {
      const [savedDate, text, reference] = verse.split(':');
      if (savedDate === date) {
        return { text, reference };
      }
    }
    return null;  // Return null if no verse for today
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

// Function to fetch a new verse from the API
const fetchNewVerse = async () => {
  try {
    const response = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json&order=random');
    const data = await response.json();
    return {
      text: data.verse.details.text,
      reference: data.verse.details.reference
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    return { text: "Error fetching verse.", reference: "" };
  }
};

// Function to save the verse to the file
const saveVerseToFile = async (date, verse) => {
  const newVerseData = `${date}:${verse.text}:${verse.reference}\n`;
  try {
    await fs.promises.appendFile(filePath, newVerseData);  // Append the new verse to the file
  } catch (error) {
    console.error('Error saving verse:', error);
  }
};
