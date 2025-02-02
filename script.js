function sendMessage() {
    const wordInput = document.getElementById("wordInput");
    const userText = wordInput.value.trim();

    if (userText) {
        // Display user message
        displayMessage(userText, "user");

        // Translate the text if it is in French
        translateToEnglish(userText)
            .then(translatedText => {
                // Once translated, fetch the definition from the dictionary API
                fetchDefinition(translatedText);
            })
            .catch(error => {
                displayMessage("Sorry, there was an error with the translation.", "bot");
            });

        // Clear the input field after sending
        wordInput.value = '';
    }
}

function translateToEnglish(text) {
    return new Promise((resolve, reject) => {
        const url = https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t&q= + encodeURIComponent(text);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const translatedText = data[0].map(item => item[0]).join(' ');
                resolve(translatedText);
            })
            .catch(error => {
                console.error('Translation error:', error);
                reject(error);
            });
    });
}

function fetchDefinition(word) {
    fetch(https://api.dictionaryapi.dev/api/v2/entries/en/${word})
        .then(response => {
            if (!response.ok) {
                throw new Error('Word not found');
            }
            return response.json();
        })
        .then(data => {
            const wordData = data[0];
            const definition = wordData.meanings.map(meaning => 
                meaning.definitions.map(def => <b>${def.definition}</b>).join('<br>') 
            ).join('<br><br>');
            const phonetic = wordData.phonetic || 'Not available';
            const audio = wordData.phonetics[0]?.audio || '';

            // Create bot response in English
            const botResponse = 
                Definition: <br>${definition}<br><br>
                Phonetic: ${phonetic}<br>
                ${audio ? <audio controls><source src="${audio}" type="audio/mp3"></audio> : ''}
            ;

            // Display bot response in English
            displayMessage(botResponse, "bot");

            // Add "Translate to French" button
            addTranslateButton(botResponse);
        })
        .catch(error => {
            // Handle error (e.g. word not found)
            displayMessage(Sorry, I couldn't find the word "${word}". Please try again., "bot");
        });
}

function addTranslateButton(response) {
    const chatBox = document.getElementById("chatBox");

    // Create the button
    const translateButton = document.createElement("button");
    translateButton.textContent = "Translate to French";
    translateButton.classList.add("translate-button");

    // Add event listener to translate the response when clicked
    translateButton.addEventListener("click", () => {
        const translatedResponse = translateToFrench(response);
        displayMessage(translatedResponse, "botFrench");
    });

    // Append the button after the bot response
    chatBox.appendChild(translateButton);
}

function translateToFrench(text) {
    // Simple translation dictionary (to translate key phrases)
    const dictionary = {
        "Definition": "Définition",
        "Phonetic": "Phonétique",
        "Not available": "Non disponible",
        "audio": "audio",
        "controls": "contrôles",
        "<b>": "<b>",  // Keep bold tag intact
        "</b>": "</b>"  // Keep bold tag intact
    };

    // Simple replacement of words in the dictionary
    let translatedText = text;

    for (const [en, fr] of Object.entries(dictionary)) {
        const regex = new RegExp(\\b${en}\\b, 'g');
        translatedText = translatedText.replace(regex, fr);
    }

    return translatedText;
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById("chatBox");

    // Create a message element
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", ${sender}-message);
    messageElement.innerHTML = message;

    // Append message to the chat box
    chatBox.appendChild(messageElement);

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add event listener to the input field for "Enter" key press
document.getElementById("wordInput").addEventListener("keypress", function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});          la rponse du bot est en anglais , je que tu ajoute une fonction traduit le texte du bot en francais 
